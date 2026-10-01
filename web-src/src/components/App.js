import React, { useState } from 'react'
import {
  Provider,
  defaultTheme,
  View,
  Flex,
  Heading,
  Content,
  Text,
  TextField,
  Button,
  ProgressCircle,
  InlineAlert,
  Well
} from '@adobe/react-spectrum'
import actions from '../config.json'

export default function App({ runtime, ims }) {
  // Do NOT call runtime.done() here — index.js calls it in the ready handler
  const helloUrl = actions['hello'] // exact action name from app.config.yaml

  const [name, setName] = useState('')
  const [greeting, setGreeting] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  async function sayHello() {
    setError(null)
    setGreeting(null)

    if (!helloUrl) {
      // config.json is empty before deploy / sandbox preview
      setError('Action URL not available yet. Deploy the app or start the sandbox to call the action.')
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch(helloUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ims.token}`,
          'x-gw-ims-org-id': ims.org
        },
        body: JSON.stringify({ name })
      })
      if (!res.ok) throw new Error(`Action failed: ${res.status}`)
      const data = await res.json()
      setGreeting(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Provider theme={defaultTheme}>
      <View padding="size-400" maxWidth="size-6000" margin="0 auto">
        <Flex direction="column" gap="size-300">
          <Heading level={1}>Hello World</Heading>
          <Content>
            <Text>
              Enter a name and call the <code>hello</code> action running on Adobe I/O Runtime.
            </Text>
          </Content>

          <TextField
            label="Your name"
            value={name}
            onChange={setName}
            width="100%"
            onKeyDown={(e) => { if (e.key === 'Enter') sayHello() }}
          />

          <Flex gap="size-200" alignItems="center">
            <Button variant="accent" onPress={sayHello} isPending={isLoading}>
              Say Hello
            </Button>
            {isLoading && <ProgressCircle aria-label="Calling action" isIndeterminate size="S" />}
          </Flex>

          {error && (
            <InlineAlert variant="negative">
              <Heading>Something went wrong</Heading>
              <Content>{error}</Content>
            </InlineAlert>
          )}

          {greeting && (
            <Well>
              <Flex direction="column" gap="size-100">
                <Heading level={3} marginBottom="size-0">{greeting.message}</Heading>
                <Text>Authenticated: {greeting.authenticated ? 'yes' : 'no'}</Text>
                <Text>Timestamp: {greeting.timestamp}</Text>
              </Flex>
            </Well>
          )}
        </Flex>
      </View>
    </Provider>
  )
}
