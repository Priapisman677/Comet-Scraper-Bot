import {z} from 'zod'

export const createUserSchema = z.object({
    body: z.object({
        username: z.string({required_error: 'Please provide a username'}).nonempty({message: 'Username cannot be empty'}),
        email: z.string({required_error: 'Please provide an email'}).email({message: 'Invalid email address'}).nonempty({message: 'Email cannot be empty'}),
        password: z.string({required_error: 'Please provide a password'}).min(6, {message: 'Password must be at least 6 characters long'}).nonempty({message: 'Password cannot be empty'}),
    }).strict()
})

export type CreateUserSchemaType = z.infer<typeof createUserSchema>['body']




export const loginSchema = z.object({
    body: z.object({
        email: z.string({required_error: 'Please provide an email'}).nonempty({message: 'Email cannot be empty'}),
        password: z.string({required_error: 'Please provide a password'}).nonempty({message: 'Password cannot be empty'}),
    }).strict()
})

export type LoginSchemaType = z.infer<typeof loginSchema>['body']
