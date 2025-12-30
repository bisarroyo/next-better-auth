'use client'

import { authClient } from '@/lib/auth-client'
import { signInAction } from '../../actions/auth'
import { useActionState, useEffect } from 'react'
import { useState } from 'react'

import { Button } from '@/components/ui/button'

import { Separator } from '@/components/ui/separator'
import Link from 'next/link'

import { useRouter, useSearchParams } from 'next/navigation'
import { toast } from 'sonner'

import { getCallbackURL } from '@/lib/shared'
import { Key } from 'lucide-react'
import { cn } from '@/lib/utils'
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

export default function SigninPage() {
    const router = useRouter()
    const params = useSearchParams()
    useEffect(() => {
        authClient.oneTap({
            fetchOptions: {
                onError: ({ error }: { error: { message: string } }) => {
                    toast.error(error.message || 'An error occurred')
                },
                onSuccess: () => {
                    toast.success('Successfully signed in')
                    router.push(getCallbackURL(params))
                }
            }
        })
    }, [router, params])

    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const initialState = {
        error: '',
        success: false
    }
    const [formValues, setFormValues] = useState({
        email: '',
        password: ''
    })

    const [state, formAction, pending] = useActionState(
        signInAction,
        initialState
    )
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
                    <CardTitle>Iniciar sesión</CardTitle>
                    <CardDescription>
                        Ingresa tu correo y contraseña para iniciar sesión
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {state.error && (
                        <div className='mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm'>
                            {state.error}
                        </div>
                    )}

                    {/* action debe apuntar a la función wrapper */}
                    <form action={formAction} className='space-y-5 '>
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
                                className='w-full'
                                required
                                value={formValues.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <div className='flex items-center mb-1'>
                                <label
                                    className='text-sm font-medium'
                                    htmlFor='password'>
                                    Contraseña
                                </label>
                                <Link
                                    href='/forgot-password'
                                    className='ml-auto inline-block text-sm underline-offset-4 hover:underline'>
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>
                            <PasswordInput
                                name='password'
                                type='password'
                                id='password'
                                className='w-full'
                                required
                                value={formValues.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div className='w-full flex justify-center'>
                            <Button
                                type='submit'
                                disabled={pending}
                                className='w-full'>
                                {pending
                                    ? 'Iniciando sesión...'
                                    : 'Iniciar sesión'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
                <CardFooter className='flex-col gap-2'>
                    <Separator className='mb-4 ' />
                    <div className='w-full flex flex-col items-center gap-4 justify-center'>
                        <GoogleButton
                            signInWithGoogle={signInWithGoogle}
                            loading={loading}
                        />
                        <Button
                            variant='outline'
                            className={cn(
                                'w-full gap-2 flex items-center relative'
                            )}
                            onClick={async () => {
                                await authClient.signIn.passkey({
                                    fetchOptions: {
                                        onSuccess() {
                                            toast.success(
                                                'Successfully signed in'
                                            )
                                            router.push(getCallbackURL(params))
                                        },
                                        onError(context) {
                                            toast.error(
                                                'Authentication failed: ' +
                                                    context.error.message
                                            )
                                        }
                                    }
                                })
                            }}>
                            <Key size={16} />
                            <span>
                                Iniciar sesión utilizando llave de acceso
                            </span>
                        </Button>
                        {error && (
                            <div className='mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm'>
                                {error}
                            </div>
                        )}
                    </div>
                    <Separator className='my-4' />

                    <p className='text-center text-sm'>
                        ¿No tienes cuenta?{' '}
                        <Link
                            href='/signup'
                            className='transition-colors duration-300 hover:text-blue-600 underline'>
                            Crear cuenta
                        </Link>
                    </p>
                </CardFooter>
            </Card>
        </section>
    )
}
