// server.js

const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } =require( "@google/generative-ai/server");
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const express = require('express');
const cors = require('cors');
const { default: axios } = require("axios");
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

const uri = "mongodb+srv://nazmussakibapurbo:IJcCEdKtlV5zlDj7@cluster0.wznn11w.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


const genAI = new GoogleGenerativeAI(process.env.API_KEY);

async function run() {
  try {
    // Connect the client to the server
    await client.connect();

    const basacollection = client.db('test').collection('rooms');
    
    console.log("Connected to MongoDB and collection initialized!");

    // Define the POST route here
    app.post('/api/generate-content', async (req, res) => {
      const { prompt } = req.body;

      try {
        // Retrieve home data from the collection
        const homeData = await basacollection.find().toArray();

        // // Combine home data and user prompt for the analysis
        // const combinedPrompt = `
        //   Analyze the following home data and respond to the user's prompt and if user asked any other question beside home ans that you are only trained for home analysis:
        //   Homes Data: ${JSON.stringify(homeData)}
        //   User Prompt: ${prompt}
        // `;
        const combinedPrompt = `
        Your developer name is nazmus sakib apurba. if u ask about developer name just tell the name. his father name is md abdur rahman and mother name is laboni rahman . now user will ask u question and u need to response according to their needs
        User Prompt: ${prompt}
        `;

        // Get the generative model and generate content
        const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(combinedPrompt);

        res.json({ content: result.response });

      } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to generate content' });
      }
    });

    app.post('/Gemini/api', async (req, res) => {
      try {
        const { name, type } = req.body;
        console.log(req.body);
    
        const fileManager = new GoogleAIFileManager(process.env.API_KEY);
        const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    
        // Upload the file to your file manager
        const uploadResult = await fileManager.uploadFile(`D:\\Project\\Gemini Ai project\\${name}`, {
          mimeType: type,
          displayName: "Home",
        });
    
        const fileUri = uploadResult.file.uri;
    
        // Generate content using the Google Generative AI model
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent([
          "Write about the image in 4 lines",
          {
            fileData: {
              fileUri: fileUri,
              mimeType: type,
            },
          },
        ]);
    
        // Extract the text from the result
        const analysisText = result.response.text(); // Make sure this method correctly extracts the text
    
        console.log('Analysis Result:', analysisText);
    
        // Send the analysis text back to the frontend
        res.status(200).json({ analysis: analysisText });
      } catch (error) {
        console.error("Error analyzing image:", error);
        res.status(500).json({ error: "Failed to analyze image", details: error.message });
      }
    });


  

const options = {
  method: 'GET',
  url: 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc',
  headers: {
    accept: 'application/json',
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzYTRmYjhjOTM4YmQ2MGJhMTJkNzQzZmQ2NWJkNTZlYyIsIm5iZiI6MTY4Mjc2OTIxOS4xMTEsInN1YiI6IjY0NGQwNTQzMmQzNzIxMWY0MTAwZjNkOSIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.rB0xfvZPxa8cIAb-Ou9u5N7v7Tbhifj6NJ6XPCcZZCM'
  }
};

axios
  .request(options)
  // .then(res => console.log(res.data))
  .catch(err => console.error(err));

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. Successfully connected to MongoDB!");
    
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Run the function to connect to MongoDB and start the server
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('working!');
});


// app.post('/api/generate-content', async (req, res) => {
//   const { prompt } = req.body;
//   try {
//     const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash"  });
//     const result = await model.generateContent(prompt);


//     res.json({ content: result.response });


//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: 'failed to generate' })

//   }
// })








// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
