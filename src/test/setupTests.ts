import repository from '../model';

beforeAll(async () => {
  await repository.connect({ url: 'sqlite://:memory:', options: { logging: false } });
  await repository.initialize();
});
afterAll(async () => {
  await repository.terminate();
  repository.close();
});