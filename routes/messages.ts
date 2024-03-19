import express, {Router} from 'express';
import fs from 'fs';
import {promises as fsPromises} from 'fs';
import path from 'path';
import {Message} from "../types";

const messagesDirectory = './messages';
const messagesRouter = Router();

messagesRouter.post('/', async (req, res) => {
  const dateTime = new Date().toISOString().replace(/:/g, '_');
  const textMessageTime = `${messagesDirectory}/${dateTime}.txt`;
  const data: Message = {
    ...req.body,
    dateTime: dateTime
  };

  try {
    await fsPromises.mkdir(messagesDirectory, {recursive: true });
    await fsPromises.writeFile(textMessageTime, JSON.stringify(data, null, 2));
    res.json(data);
  } catch (error) {
    console.error('Ошибка при записи файла:', error);
    res.status(500).send('Ошибка сервера, что-то пошло не так...');
  }
});

messagesRouter.get('/', async (req, res) => {
  try {
    const filesMain = await fs.promises.readdir(messagesDirectory);

    const fileOrderNum = filesMain.sort((a, b) => b.localeCompare(a)).slice(0, 5);

    const messages = await Promise.all(fileOrderNum.map(async (file) => {
      const content = await fs.promises.readFile(path.join(messagesDirectory, file), { encoding: 'utf-8' });
      return JSON.parse(content);
    }));

    res.json(messages);
  } catch (error) {
    console.error('Ошибка при чтении директории:', error);
    res.status(500).send('Ошибка сервера, что-то пошло не так с запросом...');
  }
});
export default messagesRouter;

