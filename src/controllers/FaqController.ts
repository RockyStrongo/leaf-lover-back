import { NextFunction, Request, Response } from "express";
import prisma from "../db-connection/prisma";
import { Faq } from "@prisma/client";

const FaqController = {
    async getAllFaqs (req: Request, res: Response, next: NextFunction) {
        try {
            const faqs = await prisma.faq.findMany()
            return res.status(200).json(faqs);
        } catch (error) {
            next(error)
        }
    },
    async getFaqs (req: Request, res: Response, next: NextFunction) {
        try {
            if (!req.query || !req.query.pageSize) {
                return res.status(403).json('query required');
            }
            const faqs = await prisma.faq.findMany();
            const page = 1;
            const perPage = parseInt(req.query.pageSize as string);

            const paginatedFaqs = await FaqController.paginateFaqs(
                faqs, page, perPage
            );
            return res.status(200).json(paginatedFaqs);
        } catch (error) {
            next(error);
        }
    },
    paginateFaqs: async (faqs: Faq[], page: number, perPage: number) => {
        const skip = (page - 1) * perPage
        const totalFaq = faqs.length
        const totalPages = Math.ceil(totalFaq / perPage)

        const paginatedFaqs = faqs.slice(skip, skip + perPage)

        return {
            faqs: paginatedFaqs,
            totalPages,
            totalFaq: totalFaq,
            currentPage: page,
            perPage,
        }
    }
}

export default FaqController;