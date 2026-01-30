import { Request, Response, NextFunction } from 'express'

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Access denied. Admin only.' })
    }
    next()
}

export const isMember = (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'MEMBER') {
        return res.status(403).json({ error: 'Access denied. Members only.' })
    }
    next()
}