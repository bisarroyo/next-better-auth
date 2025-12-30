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
        <div className='min-h-screen flex items-center justify-center px-4'>
            <div className='w-full max-w-md p-8 rounded-2xl shadow-lg border'>
                <h1 className='text-2xl font-semibold text-center mb-6'>
                    Iniciar sesión
                </h1>

                {state.error && (
                    <div className='mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm'>
                        {state.error}
                    </div>
                )}

                {/* action debe apuntar a la función wrapper */}
                <form action={formAction} className='space-y-5'>
                    <div>
                        <label className='block mb-1 text-sm font-medium'>
                            Correo
                        </label>
                        <input
                            name='email'
                            type='email'
                            className='w-full p-3 border rounded-md'
                            required
                            value={formValues.email}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className='block mb-1 text-sm font-medium'>
                            Contraseña
                        </label>
                        <input
                            name='password'
                            type='password'
                            className='w-full p-3 border rounded-md'
                            required
                            value={formValues.password}
                            onChange={handleChange}
                        />
                    </div>

                    <div className='w-full flex justify-center'>
                        <Button type='submit' disabled={pending}>
                            {pending ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </Button>
                    </div>
                </form>
                <div className='w-full flex flex-col items-center gap-4 justify-center'>
                    <button
                        type='button'
                        className='text-white bg-[#4285F4] hover:bg-[#4285F4]/90 focus:ring-4 focus:outline-none focus:ring-[#4285F4]/50 box-border border border-transparent font-medium leading-5 text-sm px-4 py-2 text-center inline-flex items-center rounded-md mt-2 disabled:opacity-50 cursor-pointer'
                        onClick={signInWithGoogle}
                        disabled={loading}>
                        <svg
                            className='w-4 h-4 me-1.5'
                            aria-hidden='true'
                            xmlns='http://www.w3.org/2000/svg'
                            width='24'
                            height='24'
                            fill='currentColor'
                            viewBox='0 0 24 24'>
                            <path
                                fillRule='evenodd'
                                d='M12.037 21.998a10.313 10.313 0 0 1-7.168-3.049 9.888 9.888 0 0 1-2.868-7.118 9.947 9.947 0 0 1 3.064-6.949A10.37 10.37 0 0 1 12.212 2h.176a9.935 9.935 0 0 1 6.614 2.564L16.457 6.88a6.187 6.187 0 0 0-4.131-1.566 6.9 6.9 0 0 0-4.794 1.913 6.618 6.618 0 0 0-2.045 4.657 6.608 6.608 0 0 0 1.882 4.723 6.891 6.891 0 0 0 4.725 2.07h.143c1.41.072 2.8-.354 3.917-1.2a5.77 5.77 0 0 0 2.172-3.41l.043-.117H12.22v-3.41h9.678c.075.617.109 1.238.1 1.859-.099 5.741-4.017 9.6-9.746 9.6l-.215-.002Z'
                                clipRule='evenodd'
                            />
                        </svg>
                        Iniciar con Google
                    </button>
                    <Button
                        variant='outline'
                        className={cn(
                            'w-full gap-2 flex items-center relative'
                        )}
                        onClick={async () => {
                            await authClient.signIn.passkey({
                                fetchOptions: {
                                    onSuccess() {
                                        toast.success('Successfully signed in')
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
                        <span>Iniciar sesión utilizando Passkey</span>
                    </Button>
                    {error && (
                        <div className='mb-4 p-3 bg-red-100 text-red-600 rounded-md text-sm'>
                            {error}
                        </div>
                    )}
                </div>
                <Separator className='my-4 bg-white/20 dark:bg-neutral-700/20' />

                <p className='text-center text-sm mt-6'>
                    ¿No tienes cuenta?{' '}
                    <Link
                        href='/signup'
                        className='text-blue-600 hover:underline'>
                        Crear cuenta
                    </Link>
                </p>
            </div>
        </div>
    )
}
