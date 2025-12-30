'use server'

import { headers } from 'next/headers'
import { auth } from '@/lib/auth'
import { z } from 'zod'

import { APIError } from 'better-auth'

const signupSchema = z
    .object({
        name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
        email: z.string().email('Ingresa un correo válido'),
        password: z
            .string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres'),
        confirmPassword: z
            .string()
            .min(8, 'La contraseña debe tener al menos 8 caracteres')
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: 'Las contraseñas no coinciden'
    })

export async function signUpAction(prevState: unknown, formData: FormData) {
    const validateFields = signupSchema.safeParse({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword')
    })
    if (!validateFields.success) {
        return {
            success: false,
            error: validateFields.error!.issues[0].message
        }
    }
    const { name, email, password } = validateFields.data
    try {
        await auth.api.signUpEmail({
            body: {
                email,
                password,
                name
            },
            headers: await headers()
        })
        return { success: true, error: null }
    } catch (err) {
        console.error('Better Auth error:', err)

        // 🔥 ERRORES CONTROLADOS DE BETTER AUTH
        if (err instanceof APIError) {
            const message =
                err.body?.message === 'User already exists. Use another email.'
                    ? 'Este correo ya está registrado. Intenta iniciar sesión.'
                    : err.body?.message ?? 'Error inesperado.'

            return {
                success: false,
                error: message
            }
        }

        // 🔥 Cualquier otro error
        return {
            success: false,
            error: 'Error inesperado. Intenta de nuevo.'
        }
    }
}

const signInSchema = z.object({
    email: z.string().email('Ingresa un correo válido'),
    password: z.string().min(8, 'Ingresa tu contraseña')
})

export async function signInAction(prevState: unknown, formData: FormData) {
    const validateFields = signInSchema.safeParse({
        email: formData.get('email'),
        password: formData.get('password')
    })
    if (!validateFields.success) {
        return {
            success: false,
            error: 'Datos inválidos'
        }
    }
    const { email, password } = validateFields.data
    try {
        await auth.api.signInEmail({
            body: {
                email,
                password
            },
            headers: await headers()
        })
        return { success: true, error: null }
    } catch (err) {
        console.error('Better Auth error:', err)

        // 🔥 ERRORES CONTROLADOS DE BETTER AUTH
        if (err instanceof APIError) {
            const message =
                err.body?.message === 'Invalid email or password'
                    ? 'Correo o contraseña incorrectos'
                    : err.body?.message ?? 'Error inesperado.'

            return {
                success: false,
                error: message
            }
        }

        // 🔥 Cualquier otro error
        return {
            success: false,
            error: 'Error inesperado. Intenta de nuevo.'
        }
    }
}

export async function signOutAction() {
    try {
        await auth.api.signOut({
            headers: await headers()
        })
    } catch (error) {
        console.log(error)
        return { error: 'Error al cerrar sesión' }
    }
}
