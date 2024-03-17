import dayjs from 'dayjs'
import { ActionController } from '../controllers/ActionController'

describe('calculateUserPlantActions', () => {
  test(`if user plant has no action, an action to create 
    should be returned with date = today + watering frequency`, () => {
    const input = {
      id: 6,
      acquisitionDate: new Date(),
      nickname: 'de',
      notes: 'sa',
      giftedBy: 'sa',
      plantId: 100,
      userId: 1,
      active: true,
      plant: {
        id: 100,
        commonName: 'evolvulus',
        scientificName: "Evolvulus glomeratus 'Hawaiian Blue Eyes'",
        description:
          "The Evolvulus glomeratus 'Hawaiian Blue Eyes' is an amazing plant species that is perfect for brightening up a garden or patio. The bright and cheerful flowers come in shades of blue, purple and white, and have a yellow eye in the centre. The flowers are held in large clusters, making it a great choice for adding colour and depth to gardens and container planting. The plant is also drought tolerant, meaning it can withstand periods of drought without too much water. As a bonus, the flowers are also attractive to butterflies and bees, making it a great addition to any eco-friendly garden.",
        type: 'Shrub',
        watering: 'Average',
        flowers: true,
        careLevel: 'Moderate',
        cuisine: false,
        poisonousToHumans: false,
        poisonousToPets: false,
        wateringGeneralBenchmarkValue: 2,
        wateringGeneralBenchmarkUnit: 'days',
        externalId: 2913,
        defaultImageThumbnail:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/thumbnail/452084892_8ea6ed4939_b.jpg',
        defaultImageRegular:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/regular/452084892_8ea6ed4939_b.jpg',
      },
      Action: [],
    }

    const expected = {
      date: new Date(new Date().setDate(new Date().getDate() + 2)),
      userPlantId: 6,
    }

    const actionToCreate = ActionController.calculateUserPlantActions(input)
    expect(actionToCreate).not.toBe(null)
    expect(actionToCreate?.date?.toISOString().split('T')[0]).toEqual(
      expected.date.toISOString().split('T')[0]
    )
    expect(actionToCreate?.date).toBeInstanceOf(Date)
    expect(actionToCreate?.userPlantId).toBe(6)
  })
  test(`if user plant has a latest action that is not done, no action should be created`, () => {
    const input = {
      id: 6,
      acquisitionDate: new Date(),
      nickname: 'de',
      notes: 'sa',
      giftedBy: 'sa',
      plantId: 100,
      userId: 1,
      active: true,
      plant: {
        id: 100,
        commonName: 'evolvulus',
        scientificName: "Evolvulus glomeratus 'Hawaiian Blue Eyes'",
        description:
          "The Evolvulus glomeratus 'Hawaiian Blue Eyes' is an amazing plant species that is perfect for brightening up a garden or patio. The bright and cheerful flowers come in shades of blue, purple and white, and have a yellow eye in the centre. The flowers are held in large clusters, making it a great choice for adding colour and depth to gardens and container planting. The plant is also drought tolerant, meaning it can withstand periods of drought without too much water. As a bonus, the flowers are also attractive to butterflies and bees, making it a great addition to any eco-friendly garden.",
        type: 'Shrub',
        watering: 'Average',
        flowers: true,
        careLevel: 'Moderate',
        cuisine: false,
        poisonousToHumans: false,
        poisonousToPets: false,
        wateringGeneralBenchmarkValue: 2,
        wateringGeneralBenchmarkUnit: 'days',
        externalId: 2913,
        defaultImageThumbnail:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/thumbnail/452084892_8ea6ed4939_b.jpg',
        defaultImageRegular:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/regular/452084892_8ea6ed4939_b.jpg',
      },
      Action: [
        {
          id: 1,
          date: new Date(),
          done: false,
          doneDate: null,
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
      ],
    }

    const actionToCreate = ActionController.calculateUserPlantActions(input)
    expect(actionToCreate).toBe(null)
  })
  test(`if user plant has a latest action that is done
   an action should be returned with date = today + watering frequency`, () => {
    const threeDaysAgo = dayjs().subtract(3, 'day').toDate()

    const input = {
      id: 6,
      acquisitionDate: new Date(),
      nickname: 'de',
      notes: 'sa',
      giftedBy: 'sa',
      plantId: 100,
      userId: 1,
      active: true,
      plant: {
        id: 100,
        commonName: 'evolvulus',
        scientificName: "Evolvulus glomeratus 'Hawaiian Blue Eyes'",
        description:
          "The Evolvulus glomeratus 'Hawaiian Blue Eyes' is an amazing plant species that is perfect for brightening up a garden or patio. The bright and cheerful flowers come in shades of blue, purple and white, and have a yellow eye in the centre. The flowers are held in large clusters, making it a great choice for adding colour and depth to gardens and container planting. The plant is also drought tolerant, meaning it can withstand periods of drought without too much water. As a bonus, the flowers are also attractive to butterflies and bees, making it a great addition to any eco-friendly garden.",
        type: 'Shrub',
        watering: 'Average',
        flowers: true,
        careLevel: 'Moderate',
        cuisine: false,
        poisonousToHumans: false,
        poisonousToPets: false,
        wateringGeneralBenchmarkValue: 2,
        wateringGeneralBenchmarkUnit: 'days',
        externalId: 2913,
        defaultImageThumbnail:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/thumbnail/452084892_8ea6ed4939_b.jpg',
        defaultImageRegular:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/regular/452084892_8ea6ed4939_b.jpg',
      },
      Action: [
        {
          id: 1,
          date: threeDaysAgo,
          done: true,
          doneDate: threeDaysAgo,
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
      ],
    }

    const todayPlus2 = dayjs().add(2, 'day').toDate()

    const expected = {
      //today + 2 days
      date: todayPlus2,
      userPlantId: 6,
    }

    const actionToCreate = ActionController.calculateUserPlantActions(input)
    expect(actionToCreate).not.toBe(null)
    expect(actionToCreate).toStrictEqual(expected)
    expect(actionToCreate?.date).toBeInstanceOf(Date)
    expect(actionToCreate?.userPlantId).toBe(6)
  })
  test('if a user plant has multiple actions, the one with the higher date should be considered (null case)', () => {
    const fourDaysAgo = dayjs().subtract(4, 'day').toDate()
    const threeDaysAgo = dayjs().subtract(3, 'day').toDate()

    const input = {
      id: 6,
      acquisitionDate: new Date(),
      nickname: 'de',
      notes: 'sa',
      giftedBy: 'sa',
      plantId: 100,
      userId: 1,
      active: true,
      plant: {
        id: 100,
        commonName: 'evolvulus',
        scientificName: "Evolvulus glomeratus 'Hawaiian Blue Eyes'",
        description:
          "The Evolvulus glomeratus 'Hawaiian Blue Eyes' is an amazing plant species that is perfect for brightening up a garden or patio. The bright and cheerful flowers come in shades of blue, purple and white, and have a yellow eye in the centre. The flowers are held in large clusters, making it a great choice for adding colour and depth to gardens and container planting. The plant is also drought tolerant, meaning it can withstand periods of drought without too much water. As a bonus, the flowers are also attractive to butterflies and bees, making it a great addition to any eco-friendly garden.",
        type: 'Shrub',
        watering: 'Average',
        flowers: true,
        careLevel: 'Moderate',
        cuisine: false,
        poisonousToHumans: false,
        poisonousToPets: false,
        wateringGeneralBenchmarkValue: 2,
        wateringGeneralBenchmarkUnit: 'days',
        externalId: 2913,
        defaultImageThumbnail:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/thumbnail/452084892_8ea6ed4939_b.jpg',
        defaultImageRegular:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/regular/452084892_8ea6ed4939_b.jpg',
      },
      Action: [
        {
          id: 1,
          date: fourDaysAgo,
          done: true,
          doneDate: fourDaysAgo,
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
        {
          id: 2,
          date: threeDaysAgo,
          done: false,
          doneDate: null,
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
      ],
    }

    expect(ActionController.calculateUserPlantActions(input)).toBe(null)
  })
  test('if a user plant has multiple actions, the one with the higher date should be considered (not null case)', () => {
    const fourDaysAgo = dayjs().subtract(4, 'day').toDate()
    const threeDaysAgo = dayjs().subtract(3, 'day').toDate()

    const input = {
      id: 6,
      acquisitionDate: new Date(),
      nickname: 'de',
      notes: 'sa',
      giftedBy: 'sa',
      plantId: 100,
      userId: 1,
      active: true,
      plant: {
        id: 100,
        commonName: 'evolvulus',
        scientificName: "Evolvulus glomeratus 'Hawaiian Blue Eyes'",
        description:
          "The Evolvulus glomeratus 'Hawaiian Blue Eyes' is an amazing plant species that is perfect for brightening up a garden or patio. The bright and cheerful flowers come in shades of blue, purple and white, and have a yellow eye in the centre. The flowers are held in large clusters, making it a great choice for adding colour and depth to gardens and container planting. The plant is also drought tolerant, meaning it can withstand periods of drought without too much water. As a bonus, the flowers are also attractive to butterflies and bees, making it a great addition to any eco-friendly garden.",
        type: 'Shrub',
        watering: 'Average',
        flowers: true,
        careLevel: 'Moderate',
        cuisine: false,
        poisonousToHumans: false,
        poisonousToPets: false,
        wateringGeneralBenchmarkValue: 2,
        wateringGeneralBenchmarkUnit: 'days',
        externalId: 2913,
        defaultImageThumbnail:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/thumbnail/452084892_8ea6ed4939_b.jpg',
        defaultImageRegular:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/regular/452084892_8ea6ed4939_b.jpg',
      },
      Action: [
        {
          id: 1,
          date: fourDaysAgo,
          done: true,
          doneDate: fourDaysAgo,
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
        {
          id: 2,
          date: threeDaysAgo,
          done: true,
          doneDate: threeDaysAgo,
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
      ],
    }

    const todayPlus2 = dayjs().add(2, 'day').toDate()

    const expected = {
      //today + 2 days
      date: todayPlus2,
      userPlantId: 6,
    }

    const actionToCreate = ActionController.calculateUserPlantActions(input)
    expect(actionToCreate).not.toBe(null)
    expect(actionToCreate).toStrictEqual(expected)
    expect(actionToCreate?.date).toBeInstanceOf(Date)
    expect(actionToCreate?.userPlantId).toBe(6)
  })
  test(`if there is already an action with the calculated date, no action should be created`, () => {
    const datePlus2 = new Date(new Date().setDate(new Date().getDate() + 2))

    const input = {
      id: 6,
      acquisitionDate: new Date(),
      nickname: 'de',
      notes: 'sa',
      giftedBy: 'sa',
      plantId: 100,
      userId: 1,
      active: true,
      plant: {
        id: 100,
        commonName: 'evolvulus',
        scientificName: "Evolvulus glomeratus 'Hawaiian Blue Eyes'",
        description:
          "The Evolvulus glomeratus 'Hawaiian Blue Eyes' is an amazing plant species that is perfect for brightening up a garden or patio. The bright and cheerful flowers come in shades of blue, purple and white, and have a yellow eye in the centre. The flowers are held in large clusters, making it a great choice for adding colour and depth to gardens and container planting. The plant is also drought tolerant, meaning it can withstand periods of drought without too much water. As a bonus, the flowers are also attractive to butterflies and bees, making it a great addition to any eco-friendly garden.",
        type: 'Shrub',
        watering: 'Average',
        flowers: true,
        careLevel: 'Moderate',
        cuisine: false,
        poisonousToHumans: false,
        poisonousToPets: false,
        wateringGeneralBenchmarkValue: 2,
        wateringGeneralBenchmarkUnit: 'days',
        externalId: 2913,
        defaultImageThumbnail:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/thumbnail/452084892_8ea6ed4939_b.jpg',
        defaultImageRegular:
          'https://perenual.com/storage/species_image/2913_evolvulus_glomeratus_hawaiian_blue_eyes/regular/452084892_8ea6ed4939_b.jpg',
      },
      Action: [
        {
          id: 1,
          date: datePlus2,
          done: true,
          doneDate: new Date(),
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
        {
          id: 2,
          date: new Date(new Date().setDate(new Date().getDate() - 4)),
          done: true,
          doneDate: new Date(new Date().setDate(new Date().getDate() - 4)),
          userPlantId: 6,
          actionTypeId: 1,
          active: true,
        },
      ],
    }

    const actionToCreate = ActionController.calculateUserPlantActions(input)
    expect(actionToCreate).toBe(null)
  })
})
