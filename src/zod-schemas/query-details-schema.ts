
import {z} from 'zod'


export const queryDetailsSchema = z.object({
    body: z.object({
        productUrl: z.string({required_error: 'Please provide a url'}).url(),
        language: z.enum(["english","spanish"], {required_error: 'Please provide a language'}),
        query: z.string({required_error: 'Please provide a query'})
    }).strict()
})

export type QueryDetailsSchemaType = z.infer<typeof queryDetailsSchema>['body']


export const compareTwoDetailsSchema = z.object({
    body: z.object({
        productUrls: z.array(z.string({required_error: 'Please provide a url'}).url()),
        language: z.enum(["english","spanish"], {required_error: 'Please provide a language'}),
        query: z.string({required_error: 'Please provide a query'})
    }).strict()
})

export type CompareTwoDetailsSchemaType = z.infer<typeof compareTwoDetailsSchema>['body']