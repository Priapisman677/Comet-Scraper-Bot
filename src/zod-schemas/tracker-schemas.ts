import {z} from 'zod'


//* S C R A P E   A L L   P R I C E S

export const scrapeAllProductsSchema = z.object({
    body: z.object({
        productName: z.string({required_error: 'Please provide a product name'})
    })
})

export type ScrapeAllProductsSchemaType = z.infer<typeof scrapeAllProductsSchema>['body']


//* A D D   /   R E M O V E   F R O M   T R A C K E R   L I S T

export const addOneToTrackerSchema = z.object({
    body: z.object({
        productUrl: z.string({required_error: 'Please provide a url'}).url(),
    }).strict()
})

export type AddOneToTrackerSchemaType = z.infer<typeof addOneToTrackerSchema>['body']



export const addManyToTrackerSchema = z.object({
    body: z.object({
        productsUrl: z.array(z.string({required_error: 'Please provide a url'}).url()),
    }).strict()
})

export type AddManyToTrackerSchemaType = z.infer<typeof addManyToTrackerSchema>['body']




export const deleteFromTrackerSchema = z.number({required_error: 'Please provide a product id'}).nonnegative()

export type DeleteFromTrackerSchemaType = z.infer<typeof deleteFromTrackerSchema>


//* C H E C K   F O R   U P D A T E S

export const checkForUpdatesSchema = z.object({
    body: z.object({
        productDetailIds: z.array(z.number()).optional()
    }).strict()
})

export type CheckForUpdatesSchemaSchemaType = z.infer<typeof checkForUpdatesSchema>['body']

