/**
 * @swagger
 * components:
 *   schemas:
 *     UserSub:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: User ID
 *         username:
 *           type: string
 *           description: Username
 *         profilePicture:
 *           type: string
 *           nullable: true
 *           description: User's profile picture URL
 *     Jersey:
 *       type: object
 *       properties:
 *         team:
 *           type: string
 *           description: Soccer team name
 *         league:
 *           type: string
 *           description: League name
 *         price:
 *           type: number
 *           description: Jersey price
 *         size:
 *           type: string
 *           enum: [XS, S, M, L, XL, XXL]
 *           description: Jersey size
 *         imageUrl:
 *           type: string
 *           description: Local path to jersey image
 *     Post:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *           description: Unique post identifier
 *         user:
 *           $ref: '#/components/schemas/UserSub'
 *         text:
 *           type: string
 *           description: Post description text
 *         image:
 *           type: string
 *           nullable: true
 *           description: Post image URL
 *         jerseyDetails:
 *           $ref: '#/components/schemas/Jersey'
 *         likes:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of user IDs who liked the post
 *         commentsCount:
 *           type: number
 *           description: Total number of comments
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/post:
 *   post:
 *     summary: Create a new post with jersey details
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - text
 *               - team
 *               - league
 *               - price
 *               - size
 *               - image
 *             properties:
 *               text:
 *                 type: string
 *                 description: Post description (max 5000 characters)
 *               team:
 *                 type: string
 *                 description: Soccer team name
 *               league:
 *                 type: string
 *                 description: League name
 *               price:
 *                 type: number
 *                 description: Jersey price (minimum 0)
 *               size:
 *                 type: string
 *                 enum: [XS, S, M, L, XL, XXL]
 *                 description: Jersey size
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Post image file
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing or invalid required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/post:
 *   get:
 *     summary: Get all posts with optional filtering
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter posts by user ID
 *       - in: query
 *         name: team
 *         schema:
 *           type: string
 *         description: Filter posts by team name
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *         description: Maximum number of posts to return
 *       - in: query
 *         name: skip
 *         schema:
 *           type: number
 *         description: Number of posts to skip for pagination
 *     responses:
 *       200:
 *         description: Posts retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Post'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/post/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Post'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/post/{id}:
 *   put:
 *     summary: Update a post (only owner can update)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               text:
 *                 type: string
 *                 description: Updated post description
 *               team:
 *                 type: string
 *                 description: Updated team name
 *               league:
 *                 type: string
 *                 description: Updated league name
 *               price:
 *                 type: number
 *                 description: Updated price
 *               size:
 *                 type: string
 *                 enum: [XS, S, M, L, XL, XXL]
 *                 description: Updated size
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Updated image file
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - only post owner can update
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/post/{id}:
 *   delete:
 *     summary: Delete a post (only owner can delete)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID to delete
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - only post owner can delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

/**
 * @swagger
 * /api/post/{id}/like:
 *   patch:
 *     summary: Toggle like on a post (atomic operation - first click likes, second click unlikes)
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID to toggle like
 *     responses:
 *       200:
 *         description: Like toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 liked:
 *                   type: boolean
 *                   description: Whether the post is now liked by the user
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       401:
 *         description: Unauthorized - authentication required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
