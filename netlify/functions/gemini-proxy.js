exports.handler = async function(event, context) {
  // 1. Controlla che la richiesta sia di tipo POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // 2. Recupera il prompt inviato dal frontend
    const { prompt } = JSON.parse(event.body);

    if (!prompt) {
      return { statusCode: 400, body: 'Prompt is required' };
    }

    // 3. Recupera la chiave API in modo sicuro dalle variabili d'ambiente di Netlify
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
       return { statusCode: 500, body: 'API key not configured' };
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

    // 4. Prepara la richiesta per l'API di Gemini
    let chatHistory = [{ role: "user", parts: [{ text: prompt }] }];
    const payload = { contents: chatHistory };

    // 5. Esegui la chiamata all'API di Gemini
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Gemini API Error:', errorBody);
      return { statusCode: response.status, body: `Gemini API Error: ${errorBody}` };
    }

    const result = await response.json();

    // 6. Restituisci la risposta al frontend
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result),
    };

  } catch (error) {
    console.error('Proxy Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal Server Error' }),
    };
  }
};