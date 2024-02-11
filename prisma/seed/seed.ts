import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import { extractWateringValue } from '../../src/services/extractWateringValue'
import { PlantsSeedDataList } from './generateImportData'

const prisma = new PrismaClient()

async function getCareGuideTypeId(type: string) {
  const careGuideType = await prisma.careGuideType.findFirst({
    where: {
      code: type,
    },
  })
  if (!careGuideType) {
    return null
  }
  return careGuideType.id
}

function readJsonFile(filePath: string): unknown {
  let rawData = fs.readFileSync(filePath, 'utf8')
  let jsonData = JSON.parse(rawData)
  return jsonData
}

function capitalizeFirstLetter(string: string) {
  const firstLetter = string.charAt(0)
  const firstLetterCap = firstLetter.toUpperCase()
  const remainingLetters = string.slice(1)
  return firstLetterCap + remainingLetters
}

async function seedDB(filePath: string) {
  //create care guide types if they don't exist yet
  await prisma.careGuideType.upsert({
    where: {
      code: 'watering',
    },
    update: {},
    create: {
      code: 'watering',
      label: 'Watering',
    },
  })
  await prisma.careGuideType.upsert({
    where: {
      code: 'sunlight',
    },
    update: {},
    create: {
      code: 'sunlight',
      label: 'Sunlight',
    },
  })

  await prisma.careGuideType.upsert({
    where: {
      code: 'pruning',
    },
    update: {},
    create: {
      code: 'pruning',
      label: 'Pruning',
    },
  })

  //get data from json seed data file
  const plantsSeedData = readJsonFile(filePath) as PlantsSeedDataList

  plantsSeedData.plantsData.forEach(async (plantData) => {
    if (
      !plantData.plant.default_image.regular_url ||
      !plantData.plant.default_image.original_url
    ) {
      console.log('no image')
      return
    }

    //check if external_id already exists in DB
    const plant = await prisma.plant.findFirst({
      where: {
        externalId: plantData.plant.id,
      },
    })
    if (plant) {
      console.log(`plant ${plantData.plant.id} already exists in DB`)
      return
    }

    //save plant in DB
    const newPlant = await prisma.plant.create({
      data: {
        commonName: capitalizeFirstLetter(plantData.plant.common_name),
        scientificName: plantData.plant.scientific_name[0] ?? '',
        description: plantData.plant.description,
        type: plantData.plant.type,
        watering: plantData.plant.watering,
        flowers: plantData.plant.flowers,
        careLevel: plantData.plant.care_level ?? 'medium',
        cuisine: plantData.plant.cuisine,
        poisonousToHumans:
          plantData.plant.poisonous_to_humans === 0 ? false : true,
        poisonousToPets: plantData.plant.poisonous_to_pets === 0 ? false : true,
        wateringGeneralBenchmarkValue:
          extractWateringValue(
            plantData.plant.watering_general_benchmark.value
          ) ?? 0,
        wateringGeneralBenchmarkUnit:
          plantData.plant.watering_general_benchmark.unit,
        externalId: plantData.plant.id,
        defaultImageThumbnail: plantData.plant.default_image.thumbnail
          ? plantData.plant.default_image.thumbnail
          : plantData.plant.default_image.original_url,
        defaultImageRegular:
          plantData.plant.default_image.regular_url ??
          plantData.plant.default_image.original_url,
      },
    })

    //save care guides for the plant in DB (if exists)
    if (plantData.careGuides && plantData.careGuides.length > 0) {
      plantData.careGuides.forEach(async (careguide) => {
        const careGuideId = await getCareGuideTypeId(careguide.type)

        if (careGuideId) {
          await prisma.careGuide.create({
            data: {
              description: careguide.description,
              plant: {
                connect: {
                  id: newPlant.id,
                },
              },
              careGuideType: {
                connect: {
                  id: careGuideId,
                },
              },
            },
          })
        }
      })
    }

    //save faqs for the plant in DB (if exists)
    if (plantData.faqs && plantData.faqs.length > 0) {
      plantData.faqs.forEach(async (faq) => {
        await prisma.faq.create({
          data: {
            question: faq.question,
            answer: faq.answer,
            plant: {
              connect: {
                id: newPlant.id,
              },
            },
          },
        })
      })
    }
  })

  plantsSeedData.standAloneFaqs.forEach(async (faq) => {
    await prisma.faq.create({
      data: {
        question: faq.question,
        answer: faq.answer,
      },
    })
  })
}

async function main() {
  //for each file in seed/data folder, run seed DB function
  const seedFiles = fs.readdirSync('./prisma/seed/data/')
  for (const file of seedFiles) {
    if (file.endsWith('.json')) {
      console.log(`seeding ${file}`)
      await seedDB(`./prisma/seed/data/${file}`)
    }
  }

  console.log('seed done')
}

main()
