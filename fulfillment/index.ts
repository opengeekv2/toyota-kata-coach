import * as express from 'express'
import { conversation } from '@assistant/conversation'
import { json } from 'body-parser'
import axios from 'axios';
import { SlotStatus } from '@assistant/conversation/dist/api/schema';

const app = conversation()

app.handle('welcome', async conv => {
  const response = await axios.get('http://localhost:1337/topic', {headers: {'Authorization': conv.headers.authorization}})
  conv.append('Okay.')
  if (response.data.length > 0) {
    conv.session.params.improvementTopics = true
  } else {
    conv.session.params.improvementTopics = false
  }
})

app.handle('iterateOrCreate', async conv => {
  const response = await axios.get('http://localhost:1337/topic', {headers: {'Authorization': conv.headers.authorization}})
  conv.append("About which topic you wish to iterate?")
  response.data.forEach((topic, position) => {
    if (position) conv.append(', ')
    conv.append(topic.name)
  });
  conv.append(".")
  conv.append('Do you wish to create a new topic?');
})

app.handle('iterate', async conv => {
  console.log('iterate')
  console.log(conv.scene.slots)

  conv.append('great')
})

app.handle('validateTopic', async conv => {
  const response = await axios.get(
    'http://localhost:1337/topic?name=' + conv.scene.slots.name.value,
    { headers: {'Authorization': conv.headers.authorization} }
  )

  if (response.data.length > 0) {
    conv.scene.slots.name.status = SlotStatus.Invalid;
    conv.append('But you already have a topic with that name. Come up with another name.')
  } else {
    conv.scene.slots.name.status = SlotStatus.Filled;
  }

})

app.handle('create', async conv => {
  const response = await axios.post(
    'http://localhost:1337/topic',
    {name: conv.scene.slots.name.value },
    { headers: {'Authorization': conv.headers.authorization}}
  );
})

const expressApp: express.Express = express()

expressApp.use(json())
expressApp.post('/fulfillment', app)
expressApp.listen(8080)
