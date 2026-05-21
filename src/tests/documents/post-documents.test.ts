import request from 'supertest';
import nock from 'nock';

import { app } from '../fixtures/setup';
import { imageKeyMock, imageNameMock } from '../fixtures/mocks/libs';
import { ERRORS } from '../../translates';
import { AUTH_BASE_URL } from '../fixtures/constants';

describe('POST /documents - uploadDocuments', () => {
    afterEach(() => {
        nock.cleanAll();
    });

    it('should upload documents successfully', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(200, { success: true });

        const response = await request(app)
            .post('/documents')
            .set('x-access-token', 'valid token')
            .attach('file1', Buffer.from('test content'), 'test.pdf')
            .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.documents).toEqual([
            {
                name: imageNameMock,
                link: `https://mock-bucket.s3.amazonaws.com/${imageKeyMock}`,
            },
        ]);
    });

    it('should fail with token required error when x-access-token header is missing', async () => {
        const response = await request(app).post('/documents').expect(403);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.TOKEN_REQUIRED);
    });

    it('should fail with auth error', async () => {
        nock(AUTH_BASE_URL).get('/auth').reply(401, { success: false });

        const response = await request(app)
            .post('/documents')
            .set('x-access-token', 'valid token')
            .expect(401);

        expect(response.body.success).toBe(false);
        const { error } = response.body;
        expect(error).not.toBeNull();
        expect(error).toBe(ERRORS.AUTH_REQUIRED);
    });
});
