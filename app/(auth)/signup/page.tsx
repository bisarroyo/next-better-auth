'use client'

import { authClient } from '@/lib/auth-client'
import { signUpAction } from '@/app/actions/auth'
import { useActionState } from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import GoogleButton from '@/components/ui/google-button'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'

export default function SignupPage() {
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const initialState = {
        error: '',
        success: false
    }

    const [state, formAction, pending] = useActionState(
        signUpAction,
        initialState
    )
    const [formValues, setFormValues] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormValues({ ...formValues, [name]: value })
    }
    const signInWithGoogle = async () => {
        try {
            setLoading(true)
            setError(null)

            await authClient.signIn.social({
                provider: 'google'
            })
        } catch (error) {
            console.log(error)
            setError('Error al iniciar sesión con Google')
        } finally {
            setLoading(false)
        }
    }

    return (
        <section className='w-full min-h-[calc(100vh-10rem)] flex items-center justify-center relative'>
            <Card className='w-full max-w-sm'>
                <CardHeader>
                    <CardTitle>Crear cuenta</CardTitle>
                    <CardDescription>
                        Ingresa tus datos para crear una cuenta nueva
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {state.error && (
                        <div className='mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm'>
                            {state.error}
                        </div>
                    )}

                    {/* action debe apuntar a la función wrapper */}
                    <form action={formAction} className='space-y-5'>
                        <div>
                            <label
                                className='block text-sm font-medium'
                                htmlFor='name'>
                                Nombre
                            </label>
                            <Input
                                name='name'
                                id='name'
                                required
                                value={formValues.name}
                                onChange={handleChange}
                                autoComplete='off'
                            />
                        </div>

                        <div>
                            <label
                                className='block mb-1 text-sm font-medium'
                                htmlFor='email'>
                                Correo
                            </label>
                            <Input
                                name='email'
                                type='email'
                                id='email'
                                required
                                value={formValues.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label
                                className='block mb-1 text-sm font-medium'
                                htmlFor='password'>
                                Contraseña
                            </label>
                            <PasswordInput
                                name='password'
                                type='password'
                                id='password'
                                required
                                value={formValues.password}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label
                                className='block mb-1 text-sm font-medium'
                                htmlFor='confirmPassword'>
                                Confirmar contraseña
                            </label>
                            <PasswordInput
                                name='confirmPassword'
                                id='confirmPassword'
                                type='password'
                                required
                                value={formValues.confirmPassword}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='w-full flex justify-center'>
                            <Button
                                type='submit'
                                disabled={pending}
                                className='w-full'>
                                {pending ? 'Creando...' : 'Registrarse'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className='flex-col gap-2'>
                    <Separator className='mb-4 ' />
                    <div className='w-full flex flex-col items-center gap-4 justify-center'>
                        <GoogleButton
                            text='Registrarme con Google'
                            signInWithGoogle={signInWithGoogle}
                            loading={loading}
                        />
                        {error && (
                            <div className='mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm'>
                                {error}
                            </div>
                        )}
                    </div>
                    <Separator className='my-4' />
                    <p className='text-center text-sm'>
                        ¿Ya tienes una cuenta?{' '}
                        <Link
                            href='/signin'
                            className='transition-colors duration-300 hover:text-blue-600 underline'>
                            Iniciar sesión
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </section>
    )
}
