const request = require('supertest');
const app = require('../app');

const AUTH = { Authorization: 'Bearer secret123' };    // match API_KEY default

describe('Todos CRUD', () => {
  it('creates, lists and deletes a todo', async () => {
    /* CREATE -------------------------------------------------- */
    const created = await request(app)
      .post('/todos')
      .set(AUTH)
      .send({ text: 'Finish 7.3HD task' })
      .expect(201);

    const id = created.body.id;

    /* LIST ---------------------------------------------------- */
    await request(app)
      .get('/todos')
      .set(AUTH)
      .expect(200)
      .expect(res => {
        expect(res.body.length).toBe(1);
        expect(res.body[0].text).toBe('Finish 7.3HD task');
      });

    /* DELETE -------------------------------------------------- */
    await request(app).delete(`/todos/${id}`).set(AUTH).expect(204);
  });
});
