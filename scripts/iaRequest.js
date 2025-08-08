const models = [
  "gpt-3.5-turbo",
  "gpt-3.5-turbo-16k",
  "gpt-4",
  "gpt-4-32k",
  "gpt-4-turbo",
  "gpt-4o",
  "gpt-4.1",
  "gpt-4.1-mini",
  "gpt-4.1-nano"
]

const geminiApiKey = 'AIzaSyBBuHs1ml4kInMNO4b94go2c0zsLISQwvM'

const iaList = {
  openai: {
    url: 'https://api.openai.com/v1/chat/completions',
    models: models,
    body: {
      messages: [
        { role: "user" }
      ]
    }
  },
  gemini: {
    url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    models: ["gemini-pro"],
    body: {
      "contents": [
        {
          "parts": [
            {
              
            }
          ]
        }
      ]
    }
  }
}

const iaRequest = async (input, apiKey, ia, model) => {
  const iaURL = iaList[ia].url
  const iaModel = iaList[ia].models.find((i) => i === model)
  if (!iaModel) return `model ${model} not exist for ${ia}`

  const iaBodyRequest = JSON.parse(JSON.stringify(iaList[ia].body));

  if (ia === 'openai') {
    iaBodyRequest.body.messages[0].content = input;
    iaBodyRequest.body.model = iaModel;
  } else if (ia === 'gemini') {
    iaBodyRequest.contents[0].parts[0].text = input;
  }

  let header

  if (ia === "gemini") header = {
    "Content-Type": "application/json",
    "X-goog-api-key": `${apiKey}`
  }
  if (ia === 'openai') header = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  }

  const response = await fetch(iaURL, {
    method: "POST",
    headers: header,
    body: JSON.stringify(iaBodyRequest)
  })

  const data = await response.json()
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || "sem resposta"
}