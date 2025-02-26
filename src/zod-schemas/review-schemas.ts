import {z} from 'zod'


export const getReviewsSchema = z.object({
    body: z.object({
        productUrl: z.string({required_error: 'Please provide a url'}).url(),
        language: z.enum(["english","spanish"], {required_error: 'Please provide a language'})
    }).strict()
})

export type getReviewsSchemaType = z.infer<typeof getReviewsSchema>['body']


export const compareTwoProductsSchema = z.object({
    body: z.object({
        productUrls: z.array(z.string().url(), {required_error: 'Please provide a url array'}),
        language: z.enum(["english","spanish"], {required_error: 'Please provide a language'})
    }).strict()
})

export type CompareTwoProductsSchemaType = z.infer<typeof compareTwoProductsSchema>['body']


export const askAboutReviewsSchema = z.object({
    body: z.object({
        productUrl: z.string({required_error: 'Please provide a url'}).url(),
        language: z.enum(["english","spanish"], {required_error: 'Please provide a language'}),
        query: z.string({required_error: 'Prompt is required'})
    }).strict()
})

export type AskAboutReviewsSchemaType = z.infer<typeof askAboutReviewsSchema>['body']
