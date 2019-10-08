import express from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT;
app.use(cors());

app.post('/send', (req, res) => {
    // TODO: Implement nodemailier logic here
    res.send('Hello World!');
});

app.listen(PORT, () =>
  console.log('Example app listening on port ' + PORT),
);