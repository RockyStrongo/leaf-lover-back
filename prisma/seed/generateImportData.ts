import dotenv from 'dotenv'
import fs from 'fs'
import { CareGuideFromAPI, CareGuideListFromApi } from '../../src/types/CareGuideFromApi'
import { FAQFromAPI, FAQListFromAPI } from '../../src/types/FAQFromAPI'
import { PlantFromApi } from '../../src/types/PlantFromApi'
dotenv.config();

export type PlantsSeedData = {
    plant: PlantFromApi,
    careGuides: CareGuideFromAPI[]
    faqs: FAQFromAPI[]
}

export type PlantsSeedDataList = {
    plantsData: PlantsSeedData[],
    standAloneFaqs: FAQFromAPI[]
}

async function getPlantFromAPI(apiHost: String, apiKey: String, plantId: number) {
    const plantUrl = `${apiHost}/api/species/details/${plantId}?key=${apiKey}`
    const response = await fetch(plantUrl)
    const apiPlant = await response.json() as PlantFromApi
    return apiPlant
}

async function getCareGuidesFromAPI(apiHost: String, apiKey: String, plantId: number) {
    const careGuideUrl = `${apiHost}/api/species-care-guide-list?key=${apiKey}&species_id=${plantId}`
    const response = await fetch(careGuideUrl)
    const apiCareGuide = await response.json() as CareGuideListFromApi
    return apiCareGuide.data[0].section
}
//FAQs related to a plant
async function getPlantFAQsfromAPI(apiHost: String, apiKey: String, plantName: String) {
    const faqsUrl = `${apiHost}/api/article-faq-list?key=${apiKey}&q=${plantName}`
    const response = await fetch(faqsUrl)
    const faqs = await response.json() as FAQListFromAPI
    return faqs.data
}

async function writeToFile(fileName: string, data: string) {
    try {
        fs.writeFileSync(`./prisma/seed/data/${fileName}`, data, 'utf8');
        console.log(`${fileName} written successfully`);
    } catch (err) {
        console.error(`An error occurred while writing to ${fileName}:`, err);
    }
}

//FAQs not related to a plant
async function getFAQsfromAPI(apiHost: String, apiKey: String) {
    const faqsUrl = `${apiHost}/api/article-faq-list?key=${apiKey}`
    const response = await fetch(faqsUrl)
    const faqs = await response.json() as FAQListFromAPI
    return faqs.data
}

async function generateImportData() {
    const apiHost = process.env.PLANT_API_HOST ?? ""
    const apiKey = process.env.PLANT_API_KEY ?? ""

    //specify here the id range from plant API you want to insert in the DB (free tier for ids from 1 to 3000)
    const fromId = 2700
    const toId = 2719

    let plantsSeedData: PlantsSeedDataList = {
        plantsData: [],
        standAloneFaqs: []
    }

    for (let index = fromId; index <= toId; index++) {
        //step 1 - get plant data
        const apiPlant = await getPlantFromAPI(apiHost, apiKey, index)

        //skip plant if no watering data or no image
        if (!apiPlant.watering_general_benchmark.value || !apiPlant.watering_general_benchmark.unit || apiPlant.default_image === null) {
            continue;
        }

        //step 2 - get care guide data for the plant
        const apiCareGuides = await getCareGuidesFromAPI(apiHost, apiKey, index)

        //step 3 - get FAQ (if exists) for the plant
        const apiFaqs = await getPlantFAQsfromAPI(apiHost, apiKey, apiPlant.common_name)

        const plantData: PlantsSeedData = {
            plant: apiPlant,
            careGuides: apiCareGuides,
            faqs: apiFaqs,
        }

        plantsSeedData.plantsData.push(plantData)
    }

    //add FAQs not related to a plant
    const standAloneFaqs = await getFAQsfromAPI(apiHost, apiKey)

    plantsSeedData.standAloneFaqs = standAloneFaqs

    //write in JSON file the data from the API
    const plantsSeedDataJson = JSON.stringify(plantsSeedData);
    // add timestamp to file name
    const date = new Date()
    const timestamp = date.getTime()
    writeToFile(`plantsSeedData${timestamp}.json`, plantsSeedDataJson)

}

generateImportData()