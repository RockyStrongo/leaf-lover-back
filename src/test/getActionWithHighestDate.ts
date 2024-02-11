import { ActionController } from '../controllers/ActionController'

describe('getActionWithHighestDate function', () => {
  test('getActionWithHighestDate function returns expected value', async () => {
    const result = ActionController.getActionWithHighestDate([
      {
        id: 1,
        date: new Date('2021-01-01'),
        done: false,
        doneDate: null,
        actionTypeId: 1,
        userPlantId: 1,
      },
      {
        id: 2,
        date: new Date('2021-01-02'),
        done: false,
        doneDate: null,
        actionTypeId: 1,
        userPlantId: 1,
      },
      {
        id: 3,
        date: new Date('2021-01-03'),
        done: false,
        doneDate: null,
        actionTypeId: 1,
        userPlantId: 1,
      },
    ])
    const expected = {
      id: 3,
      date: new Date('2021-01-03'),
      done: false,
      doneDate: null,
      actionTypeId: 1,
      userPlantId: 1,
    }
    expect(result).toEqual(expected)
  })
  test('getActionWithHighestDate function returns null if input is empty array', async () => {
    const result = ActionController.getActionWithHighestDate([])
    const expected = null
    expect(result).toEqual(expected)
  })
})
