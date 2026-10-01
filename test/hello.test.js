jest.mock('@adobe/aio-sdk', () => ({
  Core: {
    Logger: jest.fn(() => ({ info: jest.fn(), debug: jest.fn(), error: jest.fn() }))
  }
}))

const { Core } = require('@adobe/aio-sdk')
const { main } = require('../actions/hello/index.js')

describe('hello action', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns 200 and greets "World" when no name supplied', async () => {
    const res = await main({})
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Hello, World!')
    expect(res.body.authenticated).toBe(false)
    expect(typeof res.body.timestamp).toBe('string')
  })

  it('returns 200 and greets the provided name', async () => {
    const res = await main({ name: 'Garvit' })
    expect(res.statusCode).toBe(200)
    expect(res.body.message).toBe('Hello, Garvit!')
  })

  it('reports authenticated when an IMS token is present', async () => {
    const res = await main({ __ow_headers: { authorization: 'Bearer abc123' } })
    expect(res.statusCode).toBe(200)
    expect(res.body.authenticated).toBe(true)
  })

  it('returns 500 when logging/SDK throws', async () => {
    Core.Logger.mockImplementationOnce(() => { throw new Error('SDK failure') })
    const res = await main({ name: 'x' })
    expect(res.statusCode).toBe(500)
    expect(res.body.error).toBe('SDK failure')
  })
})
