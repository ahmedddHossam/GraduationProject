const asyncWrapper = require('../middleware/asyncWrapper');
const db = require('../models')
const appError = require('../utils/appError');
const httpStatus = require('../utils/httpStatusText');
const initializeSocket = require('../config/socketConfig');
const transporter = require('../config/emailConfig');
const fs = require('fs');
const path = require('path');
const {where} = require("sequelize");
require('dotenv').config();


const addAnnouncement = asyncWrapper(async (req,res,next)=>{
    const {Title, Description} = req.body;


    if(!Title){
        res.status(400).json({status:httpStatus.FAIL,message: 'Title is required'})
    }

    if(!Description){
        res.status(400).json({status:httpStatus.FAIL,message: 'Description is required'})

    }
    try{
        const admin = await db.admin.findOne({where:{userUserId:req.currentUser.id}});

        const newAnnounce = new db.announcement({
            Title: Title,
            Description: Description,
            adminId: admin.AdminId
        });
        await newAnnounce.save();
        return res.status(201).json({status: httpStatus.SUCCESS, data: {data:newAnnounce,message: "Added successfully"}});
    }
    catch (err)
    {
        console.error(err);
        const error = appError.create('Internal server error on add new announcement ', 500, httpStatus.FAIL);
        return next(error);
    }
})


const deleteAnnouncement = asyncWrapper(async (req,res,next)=>{

    const {announceId} = req.params;

    try {
        const announce = await db.announcement.findByPk(announceId);

        if (!announce) {
            return res.status(404).json({ message: 'announce not found' });
        }
        await announce.destroy();

        res.status(200).json({ message: 'announcement deleted successfully' });
    } catch (err) {
        console.error(err);
        const error = appError.create('Internal server error', 500, httpStatus.FAIL);
        return next(error);
    }
})

const updateAnnouncement = asyncWrapper(async (req,res,next)=>{
    const {announceId} = req.params;
    const { Title,Description} = req.body; // Add other fields as necessary

    try {
        const announce = await db.announcement.findByPk(announceId);

        if (!announce) {
            return res.status(404).json({ message: 'announce not found' });
        }
        // Update job fields
        announce.Title = Title || announce.Title;
        announce.Description = Description || announce.Description;
        // Update other fields as necessary

        await announce.save();
        res.status(200).json({ message: 'announcement updated successfully', announce });
    } catch (err) {
        console.error(err);
        const error = appError.create('Internal server error on update announcement', 500, httpStatus.FAIL);
        return next(error);    }
})

const getAllAnnouncement = asyncWrapper(async (req,res,next)=>{
    try{
        const allAnnouncement = await db.announcement.findAll();
        if (!allAnnouncement) {
            return res.status(404).json({message: 'announce not found'});

        }
        res.status(200).json({ data: allAnnouncement });

    }
    catch (err)
    {
        console.error(err);
        const error = appError.create('Internal server error in retrieving announcement', 500, httpStatus.FAIL);
        return next(error);
    }
})
module.exports={addAnnouncement,deleteAnnouncement,updateAnnouncement,getAllAnnouncement};