import { Request, Response } from 'express';
import { WetlandRequest } from '~/backend/rfy';
import * as Wetland from 'wetland';

const express = require('express');
const router = express.Router();

import * as RFY from '~/backend/rfy';
import * as entities from '~/backend/entity'
import * as models from '~/common/models'

router.get('/api/settings', async (req: WetlandRequest, res: Response) =>
{
    let manager = RFY.wetland.getManager();
    let token = req.headers.access_token;

    //TODO check access
    let settings : entities.Setting = await manager.getRepository(entities.Setting).findOne();
    res.json( settings );
});

module.exports = router;