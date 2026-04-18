/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         firstName:
 *           type: string
 *           example: John
 *         lastName:
 *           type: string
 *           example: Doe
 *         email:
 *           type: string
 *           format: email
 *           example: john@example.com
 *         password:
 *           type: string
 *           description: Hashed password
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           example: All fields are required
 */

/**
 * @swagger
 * /register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - firstName
 *               - lastName
 *               - email
 *               - password
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: John
 *               lastName:
 *                 type: string
 *                 example: Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 registeredUser:
 *                   $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error or duplicate email
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Authenticate a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: secret123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Login successful
 *       400:
 *         description: Invalid credentials or missing fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /files/upload:
 *   post:
 *     summary: Upload a file to a room
 *     description: >
 *       Uploads a file (max 50 MB) and broadcasts a `file-ready` event to all
 *       WebSocket clients in the specified room.
 *     tags: [Files]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *               - roomId
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: The file to upload (max 50 MB)
 *               roomId:
 *                 type: string
 *                 format: uuid
 *                 description: The room to share the file in
 *                 example: 550e8400-e29b-41d4-a716-446655440000
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 fileName:
 *                   type: string
 *                   example: report.pdf
 *                 downloadUrl:
 *                   type: string
 *                   format: uri
 *                   example: http://localhost:8080/uploadedFiles/uuid-report.pdf
 *       400:
 *         description: No file uploaded or missing roomId
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /files/{filename}:
 *   get:
 *     summary: Download a file by filename
 *     tags: [Files]
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The stored filename (UUID prefix + original name)
 *         example: 550e8400-e29b-41d4-a716-446655440000-report.pdf
 *     responses:
 *       200:
 *         description: File download starts
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: File not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: File not found
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     WS_CreateRoom:
 *       type: object
 *       description: "WebSocket: Send to create a new room. Server replies with `room-created`."
 *       properties:
 *         type:
 *           type: string
 *           enum: [createRoom]
 *       example:
 *         type: createRoom
 *     WS_RoomCreated:
 *       type: object
 *       description: "WebSocket: Server response after room creation."
 *       properties:
 *         type:
 *           type: string
 *           example: room-created
 *         message:
 *           type: string
 *           example: Room created successfully
 *         roomId:
 *           type: string
 *           format: uuid
 *     WS_Join:
 *       type: object
 *       description: "WebSocket: Send to join an existing room. Server replies with `join-ack` and the latest file if one exists."
 *       required:
 *         - type
 *         - roomId
 *       properties:
 *         type:
 *           type: string
 *           enum: [join]
 *         roomId:
 *           type: string
 *           format: uuid
 *       example:
 *         type: join
 *         roomId: 550e8400-e29b-41d4-a716-446655440000
 *     WS_JoinAck:
 *       type: object
 *       description: "WebSocket: Server acknowledgement after joining a room."
 *       properties:
 *         type:
 *           type: string
 *           example: join-ack
 *         roomId:
 *           type: string
 *           format: uuid
 *         message:
 *           type: string
 *           example: Joined room successfully
 *     WS_Message:
 *       type: object
 *       description: "WebSocket: Send a text message to all members in a room."
 *       required:
 *         - type
 *         - roomId
 *         - message
 *       properties:
 *         type:
 *           type: string
 *           enum: [message]
 *         roomId:
 *           type: string
 *           format: uuid
 *         message:
 *           type: string
 *       example:
 *         type: message
 *         roomId: 550e8400-e29b-41d4-a716-446655440000
 *         message: Hello room!
 *     WS_FileReady:
 *       type: object
 *       description: "WebSocket: Broadcast to room members when a file is uploaded via POST /files/upload."
 *       properties:
 *         type:
 *           type: string
 *           example: file-ready
 *         fileName:
 *           type: string
 *           example: report.pdf
 *         fileType:
 *           type: string
 *           example: application/pdf
 *         fileSize:
 *           type: integer
 *           example: 204800
 *         downloadUrl:
 *           type: string
 *           format: uri
 *           example: http://localhost:8080/uploadedFiles/uuid-report.pdf
 *     WS_Identify:
 *       type: object
 *       description: "WebSocket: Sent by the server on initial connection to assign a client ID."
 *       properties:
 *         type:
 *           type: string
 *           example: identify
 *         clientId:
 *           type: string
 *           format: uuid
 *     WS_Error:
 *       type: object
 *       description: "WebSocket: Error response for invalid requests."
 *       properties:
 *         type:
 *           type: string
 *           example: error
 *         message:
 *           type: string
 *           example: roomId is required
 */

module.exports = {};
