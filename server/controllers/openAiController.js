const dotenv = require("dotenv").config();
const OpenAi = require("openai");

const openaiKey = process.env.openaiKey;
const openai = new OpenAi({ apiKey: openaiKey });


exports.getGptConv = async (req, res) => {
  try {
    const userId = req.user.id;

    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    
    const previousMessages = await Message.find({ user: userId }).sort({ createdAt: 1 });

    
    const messages = previousMessages.map(msg => [
      { role: "user", content: msg.content },
      { role: "assistant", content: msg.response }
    ]).flat();

    
    res.status(200).json(messages);

  } catch (error) {
    console.error("Error retrieving conversation:", error.message || error);
    res.status(500).send("Error retrieving conversation");
  }
};


exports.gpt = async (req, res) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    const previousMessages = await Message.find({ user: userId }).sort({ createdAt: 1 });
    const messages = previousMessages.map(msg => [
      { role: "user", content: msg.content },
      { role: "assistant", content: msg.response }
    ]).flat();

    messages.push({ role: "user", content });

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      max_tokens: 100
    });

    if (completion && completion.choices && completion.choices.length > 0) {
      const response = completion.choices[0].message.content;

      const message = new Message({
        user: user._id,
        content: content,
        response: response
      });

      await message.save();

      res.send({ response });
    } else {
      throw new Error("No choices found in the completion response");
    }
  } catch (error) {
    console.error("Error creating completion:", error.message || error);
    res.status(500).send("Error creating completion");
  }
};


exports.dalle3 = async (req, res) => {
  try {
    const { content } = req.body;
    console.log("step passed")

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: content,
      size: "1024x1024",
      quality: "standard",
      n: 1
    });

    const imageUrl = response.data[0].url;


    res.send(imageUrl);
  } catch (error) {
    console.error('Error creating image:', error);
    res.status(500).send('Error creating image');
  }
};


exports.dalle2 = async (req, res) => {
  try {
    const userId = req.user.id;
    const imagePath = path.join(__dirname, '..', 'uploads', 'image_1718341640716.png');

    if (!fs.existsSync(imagePath)) {
      return res.status(404).send('Image not found');
    }

    const response = await openai.images.createVariation({
      model: "dall-e-2",
      image: fs.createReadStream(imagePath),
      n: 1,
      size: "1024x1024"
    });

    const imageUrl = response.data[0].url;

    
    const image = new Image({
      user: userId,
      prompt: "Variation of an existing image",
      url: imageUrl
    });

    await image.save();

    res.send({ imageUrl: imageUrl });
  } catch (error) {
    console.error('Error creating image variation:', error);
    res.status(500).send('Error creating image variation');
  }
};
