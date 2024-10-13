"use strict";
const express = require('express');
const router = express.Router();
const knowledgeBaseService = require('../src/services/knowledgeBaseService');
const ticketService = require('../src/ticket');
const { isAgent, isUser } = require('../middleware/role');

// Route to display all articles (for users)
router.get('/articles', isUser, async (req, res) => {
    try {
        const articles = await knowledgeBaseService.getAllArticles();
        res.render('ticket/pages/articles', { articles, user: req.user });
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).send('Error fetching articles');
    }
});

// Route to show article creation form (for agents)
router.get('/articles/new', isAgent, async (req, res) => {
    try {
        const categories = await ticketService.getAllCategories(); // Get available categories
        res.render('ticket/pages/new_article', { user: req.user, categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).send('Error fetching categories');
    }
});

// Route to handle article creation (for agents)
router.post('/articles/create', isAgent, async (req, res) => {
    const { title, content, category } = req.body;
    try {
        await knowledgeBaseService.createArticle(title, content, category, req.user.id);
        res.redirect('/knowledge_base/articles');
    } catch (error) {
        console.error('Error creating article:', error);
        res.status(500).send('Error creating article');
    }
});


// Route to handle deleting an article (for agents)
router.post('/articles/delete/:id', isAgent, async (req, res) => {
    const articleId = req.params.id;
    try {
        await knowledgeBaseService.deleteArticle(articleId);
        res.redirect('/knowledge_base/articles');
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).send('Error deleting article');
    }
});

// Route to view the full article
router.get('/articles/:id', isUser, async (req, res) => {
    const articleId = req.params.id;
    try {
        const article = await knowledgeBaseService.getArticleById(articleId);
        if (!article) {
            return res.status(404).send('Article not found');
        }
        res.render('ticket/pages/view_article', { article, user: req.user});
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).send('Error fetching article');
    }
});


module.exports = router;