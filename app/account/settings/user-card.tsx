'use client'

import {
    Edit,
    Fingerprint,
    Laptop,
    Loader2,
    LogOut,
    Plus,
    QrCode,
    ShieldCheck,
    ShieldOff,
    Smartphone,
    StopCircle,
    Trash,
    X
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useState, useTransition } from 'react'
import QRCode from 'react-qr-code'
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import CopyButton from '@/components/ui/copy-button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/password-input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { authClient } from '@/lib/auth-client'
import type { Session } from '@/lib/auth-types'
import { Passkey } from '@better-auth/passkey'

export default function UserCard(props: {
    session: Session | null
    activeSessions: Session['session'][]
}) {
    const router = useRouter()

    const { data: session } = authClient.useSession()

    const signOut = () =>
        authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    window.location.href = '/signin'
                }
            }
        })

    const [isTerminating, setIsTerminating] = useState<string>()
    const [isPendingTwoFa, setIsPendingTwoFa] = useState<boolean>(false)
    const [twoFaPassword, setTwoFaPassword] = useState<string>('')
    const [twoFactorDialog, setTwoFactorDialog] = useState<boolean>(false)
    const [twoFactorVerifyURI, setTwoFactorVerifyURI] = useState<string>('')
    const [isSignOut, setIsSignOut] = useState<boolean>(false)
    const [emailVerificationPending, setEmailVerificationPending] =
        useState<boolean>(false)
    const [activeSessions, setActiveSessions] = useState(props.activeSessions)
    const removeActiveSession = (id: string) =>
        setActiveSessions(activeSessions.filter((session) => session.id !== id))

    return (
        <Card>
            <CardHeader>
                <CardTitle>User</CardTitle>
            </CardHeader>
            <CardContent className='grid gap-8 grid-cols-1'>
                <div className='flex flex-col gap-2'>
                    <div className='flex items-start justify-between'>
                        <div className='flex items-center gap-4'>
                            <Avatar className='hidden h-9 w-9 sm:flex '>
                                <AvatarImage
                                    src={session?.user.image || undefined}
                                    alt='Avatar'
                                    className='object-cover'
                                />
                                <AvatarFallback>
                                    {session?.user.name.charAt(0)}
                                </AvatarFallback>
                            </Avatar>
                            <div className='grid'>
                                <div className='flex items-center gap-1'>
                                    <p className='text-sm font-medium leading-none'>
                                        {session?.user.name}
                                    </p>
                                </div>
                                <p className='text-sm'>{session?.user.email}</p>
                            </div>
                        </div>
                        <EditUserDialog />
                    </div>
                </div>

                {session?.user.emailVerified ? null : (
                    <Alert>
                        <AlertTitle>Verifica tu correo electrónico</AlertTitle>
                        <AlertDescription className='text-muted-foreground'>
                            Por favor verifica tu correo electrónico para
                            asegurar la seguridad de tu cuenta.
                            <Button
                                size='sm'
                                variant='secondary'
                                className='mt-2'
                                onClick={async () => {
                                    await authClient.sendVerificationEmail(
                                        {
                                            email: session?.user.email || ''
                                        },
                                        {
                                            onRequest(context) {
                                                setEmailVerificationPending(
                                                    true
                                                )
                                            },
                                            onError(context: {
                                                error: { message: string }
                                            }) {
                                                toast.error(
                                                    context.error.message
                                                )
                                                setEmailVerificationPending(
                                                    false
                                                )
                                            },
                                            onSuccess() {
                                                toast.success(
                                                    'Correo de verificación enviado con éxito'
                                                )
                                                setEmailVerificationPending(
                                                    false
                                                )
                                            }
                                        }
                                    )
                                }}>
                                {emailVerificationPending ? (
                                    <Loader2
                                        size={15}
                                        className='animate-spin'
                                    />
                                ) : (
                                    'Enviar correo de verificación'
                                )}
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}

                <div className='border-l-2 px-2 w-max gap-1 flex flex-col'>
                    <p className='text-xs font-medium '>Sesiones activas</p>
                    {activeSessions
                        .filter((session) => session.userAgent)
                        .map((session) => {
                            console.log(session)
                            return (
                                <div key={session.id}>
                                    <div className='flex items-center gap-2 text-sm  text-black font-medium dark:text-white'>
                                        {new UAParser(
                                            session.userAgent || ''
                                        ).getDevice().type === 'mobile' ? (
                                            <Smartphone />
                                        ) : (
                                            <Laptop size={16} />
                                        )}
                                        {new UAParser(
                                            session.userAgent || ''
                                        ).getOS().name || session.userAgent}
                                        ,{' '}
                                        {
                                            new UAParser(
                                                session.userAgent || ''
                                            ).getBrowser().name
                                        }
                                        <button
                                            className='text-red-500 opacity-80  cursor-pointer text-xs border-muted-foreground border-red-600  underline'
                                            onClick={async () => {
                                                setIsTerminating(session.id)
                                                const res =
                                                    await authClient.revokeSession(
                                                        {
                                                            token: session.token
                                                        }
                                                    )

                                                if (res.error) {
                                                    toast.error(
                                                        res.error.message
                                                    )
                                                } else {
                                                    toast.success(
                                                        'Sesión terminada con éxito'
                                                    )
                                                    removeActiveSession(
                                                        session.id
                                                    )
                                                }
                                                if (
                                                    session.id ===
                                                    props.session?.session.id
                                                )
                                                    router.refresh()
                                                setIsTerminating(undefined)
                                            }}>
                                            {isTerminating === session.id ? (
                                                <Loader2
                                                    size={15}
                                                    className='animate-spin'
                                                />
                                            ) : session.id ===
                                              props.session?.session.id ? (
                                                'Cerrar sesión actual'
                                            ) : (
                                                'Terminar'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                </div>
                <div className='border-y py-4 flex items-center flex-wrap justify-between gap-2'>
                    <div className='flex flex-col gap-2'>
                        <p className='text-sm'>Llaves de acceso</p>
                        <div className='flex gap-2 flex-wrap'>
                            <AddPasskey />
                            <ListPasskeys />
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <p className='text-sm'>Autenticación de 2 factores</p>
                        <div className='flex gap-2'>
                            {!!session?.user.twoFactorEnabled && (
                                <Dialog>
                                    <DialogTrigger asChild>
                                        <Button
                                            variant='outline'
                                            className='gap-2'>
                                            <QrCode size={16} />
                                            <span className='md:text-sm text-xs'>
                                                Escanear código QR
                                            </span>
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className='sm:max-w-[425px] w-11/12'>
                                        <DialogHeader>
                                            <DialogTitle>
                                                Escanear código QR
                                            </DialogTitle>
                                            <DialogDescription>
                                                Escaneaa código QR con tu
                                                aplicación TOTP
                                            </DialogDescription>
                                        </DialogHeader>

                                        {twoFactorVerifyURI ? (
                                            <>
                                                <div className='flex items-center justify-center'>
                                                    <QRCode
                                                        value={
                                                            twoFactorVerifyURI
                                                        }
                                                    />
                                                </div>
                                                <div className='flex gap-2 items-center justify-center'>
                                                    <p className='text-sm text-muted-foreground'>
                                                        Copia este URI de
                                                        verificación:
                                                    </p>
                                                    <CopyButton
                                                        textToCopy={
                                                            twoFactorVerifyURI
                                                        }
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <div className='flex flex-col gap-2'>
                                                <PasswordInput
                                                    value={twoFaPassword}
                                                    onChange={(
                                                        e: React.ChangeEvent<HTMLInputElement>
                                                    ) =>
                                                        setTwoFaPassword(
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder='Ingresa tu contraseña'
                                                />
                                                <Button
                                                    onClick={async () => {
                                                        if (
                                                            twoFaPassword.length <
                                                            8
                                                        ) {
                                                            toast.error(
                                                                'La contraseña debe tener al menos 8 caracteres'
                                                            )
                                                            return
                                                        }
                                                        await authClient.twoFactor.getTotpUri(
                                                            {
                                                                password:
                                                                    twoFaPassword
                                                            },
                                                            {
                                                                onSuccess(context: {
                                                                    data: {
                                                                        totpURI: string
                                                                    }
                                                                }) {
                                                                    setTwoFactorVerifyURI(
                                                                        context
                                                                            .data
                                                                            .totpURI
                                                                    )
                                                                }
                                                            }
                                                        )
                                                        setTwoFaPassword('')
                                                    }}>
                                                    Mostrar código QR
                                                </Button>
                                            </div>
                                        )}
                                    </DialogContent>
                                </Dialog>
                            )}
                            <Dialog
                                open={twoFactorDialog}
                                onOpenChange={setTwoFactorDialog}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant={
                                            session?.user.twoFactorEnabled
                                                ? 'destructive'
                                                : 'outline'
                                        }
                                        className='gap-2'>
                                        {session?.user.twoFactorEnabled ? (
                                            <ShieldOff size={16} />
                                        ) : (
                                            <ShieldCheck size={16} />
                                        )}
                                        <span className='md:text-sm text-xs'>
                                            {session?.user.twoFactorEnabled
                                                ? 'Desactivar 2FA'
                                                : 'Activar 2FA'}
                                        </span>
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className='sm:max-w-[425px] w-11/12'>
                                    <DialogHeader>
                                        <DialogTitle>
                                            {session?.user.twoFactorEnabled
                                                ? 'Desactivar 2FA'
                                                : 'Activar 2FA'}
                                        </DialogTitle>
                                        <DialogDescription>
                                            {session?.user.twoFactorEnabled
                                                ? 'Desactiva 2FA para tu cuenta'
                                                : 'Activa 2FA para tu cuenta'}
                                        </DialogDescription>
                                    </DialogHeader>

                                    {twoFactorVerifyURI ? (
                                        <div className='flex flex-col gap-2'>
                                            <div className='flex items-center justify-center'>
                                                <QRCode
                                                    value={twoFactorVerifyURI}
                                                />
                                            </div>
                                            <Label htmlFor='password'>
                                                Escanear código OTP
                                            </Label>
                                            <Input
                                                value={twoFaPassword}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    setTwoFaPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder='Ingresa el código OTP'
                                            />
                                        </div>
                                    ) : (
                                        <div className='flex flex-col gap-2'>
                                            <Label htmlFor='password'>
                                                Contraseña
                                            </Label>
                                            <PasswordInput
                                                id='password'
                                                placeholder='Contraseña'
                                                value={twoFaPassword}
                                                onChange={(
                                                    e: React.ChangeEvent<HTMLInputElement>
                                                ) =>
                                                    setTwoFaPassword(
                                                        e.target.value
                                                    )
                                                }
                                            />
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <Button
                                            disabled={isPendingTwoFa}
                                            onClick={async () => {
                                                if (
                                                    twoFaPassword.length < 8 &&
                                                    !twoFactorVerifyURI
                                                ) {
                                                    toast.error(
                                                        'La contraseña debe tener al menos 8 caracteres'
                                                    )
                                                    return
                                                }
                                                setIsPendingTwoFa(true)
                                                if (
                                                    session?.user
                                                        .twoFactorEnabled
                                                ) {
                                                    const res =
                                                        await authClient.twoFactor.disable(
                                                            {
                                                                password:
                                                                    twoFaPassword,
                                                                fetchOptions: {
                                                                    onError(context: {
                                                                        error: {
                                                                            message: string
                                                                        }
                                                                    }) {
                                                                        toast.error(
                                                                            context
                                                                                .error
                                                                                .message
                                                                        )
                                                                    },
                                                                    onSuccess() {
                                                                        toast(
                                                                            '2FA desactivado con éxito'
                                                                        )
                                                                        setTwoFactorDialog(
                                                                            false
                                                                        )
                                                                    }
                                                                }
                                                            }
                                                        )
                                                } else {
                                                    if (twoFactorVerifyURI) {
                                                        await authClient.twoFactor.verifyTotp(
                                                            {
                                                                code: twoFaPassword,
                                                                fetchOptions: {
                                                                    onError(context: {
                                                                        error: {
                                                                            message: string
                                                                        }
                                                                    }) {
                                                                        setIsPendingTwoFa(
                                                                            false
                                                                        )
                                                                        setTwoFaPassword(
                                                                            ''
                                                                        )
                                                                        toast.error(
                                                                            context
                                                                                .error
                                                                                .message
                                                                        )
                                                                    },
                                                                    onSuccess() {
                                                                        toast(
                                                                            '2FA activado con éxito'
                                                                        )
                                                                        setTwoFactorVerifyURI(
                                                                            ''
                                                                        )
                                                                        setIsPendingTwoFa(
                                                                            false
                                                                        )
                                                                        setTwoFaPassword(
                                                                            ''
                                                                        )
                                                                        setTwoFactorDialog(
                                                                            false
                                                                        )
                                                                    }
                                                                }
                                                            }
                                                        )
                                                        return
                                                    }
                                                    const res =
                                                        await authClient.twoFactor.enable(
                                                            {
                                                                password:
                                                                    twoFaPassword,
                                                                fetchOptions: {
                                                                    onError(context: {
                                                                        error: {
                                                                            message: string
                                                                        }
                                                                    }) {
                                                                        toast.error(
                                                                            context
                                                                                .error
                                                                                .message
                                                                        )
                                                                    },
                                                                    onSuccess(ctx: {
                                                                        data: {
                                                                            totpURI: string
                                                                        }
                                                                    }) {
                                                                        setTwoFactorVerifyURI(
                                                                            ctx
                                                                                .data
                                                                                .totpURI
                                                                        )
                                                                        // toast.success("2FA enabled successfully");
                                                                        // setTwoFactorDialog(false);
                                                                    }
                                                                }
                                                            }
                                                        )
                                                }
                                                setIsPendingTwoFa(false)
                                                setTwoFaPassword('')
                                            }}>
                                            {isPendingTwoFa ? (
                                                <Loader2
                                                    size={15}
                                                    className='animate-spin'
                                                />
                                            ) : session?.user
                                                  .twoFactorEnabled ? (
                                                'Descativar 2FA'
                                            ) : (
                                                'Activar 2FA'
                                            )}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className='gap-2 justify-between items-center'>
                <ChangePassword />
                {session?.session.impersonatedBy ? (
                    <Button
                        className='gap-2 z-10'
                        variant='secondary'
                        onClick={async () => {
                            setIsSignOut(true)
                            await authClient.admin.stopImpersonating()
                            setIsSignOut(false)
                            toast.info('Impersonation stopped successfully')
                            router.push('/admin')
                        }}
                        disabled={isSignOut}>
                        <span className='text-sm'>
                            {isSignOut ? (
                                <Loader2 size={15} className='animate-spin' />
                            ) : (
                                <div className='flex items-center gap-2'>
                                    <StopCircle size={16} color='red' />
                                    Stop Impersonation
                                </div>
                            )}
                        </span>
                    </Button>
                ) : (
                    <Button
                        className='gap-2 z-10'
                        variant='secondary'
                        onClick={async () => {
                            setIsSignOut(true)
                            await signOut()
                            setIsSignOut(false)
                        }}
                        disabled={isSignOut}>
                        <span className='text-sm'>
                            {isSignOut ? (
                                <Loader2 size={15} className='animate-spin' />
                            ) : (
                                <div className='flex items-center gap-2'>
                                    <LogOut size={16} />
                                    Sign Out
                                </div>
                            )}
                        </span>
                    </Button>
                )}
            </CardFooter>
        </Card>
    )
}

async function convertImageToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
    })
}

function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState<string>('')
    const [newPassword, setNewPassword] = useState<string>('')
    const [confirmPassword, setConfirmPassword] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [open, setOpen] = useState<boolean>(false)
    const [signOutDevices, setSignOutDevices] = useState<boolean>(false)
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className='gap-2 z-10' variant='outline' size='sm'>
                    <svg
                        xmlns='http://www.w3.org/2000/svg'
                        width='1em'
                        height='1em'
                        viewBox='0 0 24 24'>
                        <path
                            fill='currentColor'
                            d='M2.5 18.5v-1h19v1zm.535-5.973l-.762-.442l.965-1.693h-1.93v-.884h1.93l-.965-1.642l.762-.443L4 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L4 10.835zm8 0l-.762-.442l.966-1.693H9.308v-.884h1.93l-.965-1.642l.762-.443L12 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L12 10.835zm8 0l-.762-.442l.966-1.693h-1.931v-.884h1.93l-.965-1.642l.762-.443L20 9.066l.966-1.643l.761.443l-.965 1.642h1.93v.884h-1.93l.965 1.693l-.762.442L20 10.835z'></path>
                    </svg>
                    <span className='text-sm text-muted-foreground'>
                        Change Password
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px] w-11/12'>
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>Change your password</DialogDescription>
                </DialogHeader>
                <div className='grid gap-2'>
                    <Label htmlFor='current-password'>Current Password</Label>
                    <PasswordInput
                        id='current-password'
                        value={currentPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setCurrentPassword(e.target.value)
                        }
                        autoComplete='new-password'
                        placeholder='Password'
                    />
                    <Label htmlFor='new-password'>New Password</Label>
                    <PasswordInput
                        value={newPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setNewPassword(e.target.value)
                        }
                        autoComplete='new-password'
                        placeholder='New Password'
                    />
                    <Label htmlFor='password'>Confirm Password</Label>
                    <PasswordInput
                        value={confirmPassword}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setConfirmPassword(e.target.value)
                        }
                        autoComplete='new-password'
                        placeholder='Confirm Password'
                    />
                    <div className='flex gap-2 items-center'>
                        <Checkbox
                            onCheckedChange={(checked) =>
                                checked
                                    ? setSignOutDevices(true)
                                    : setSignOutDevices(false)
                            }
                        />
                        <p className='text-sm'>Sign out from other devices</p>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        onClick={async () => {
                            if (newPassword !== confirmPassword) {
                                toast.error('Passwords do not match')
                                return
                            }
                            if (newPassword.length < 8) {
                                toast.error(
                                    'Password must be at least 8 characters'
                                )
                                return
                            }
                            setLoading(true)
                            const res = await authClient.changePassword({
                                newPassword: newPassword,
                                currentPassword: currentPassword,
                                revokeOtherSessions: signOutDevices
                            })
                            setLoading(false)
                            if (res.error) {
                                toast.error(
                                    res.error.message ||
                                        "Couldn't change your password! Make sure it's correct"
                                )
                            } else {
                                setOpen(false)
                                toast.success('Password changed successfully')
                                setCurrentPassword('')
                                setNewPassword('')
                                setConfirmPassword('')
                            }
                        }}>
                        {loading ? (
                            <Loader2 size={15} className='animate-spin' />
                        ) : (
                            'Change Password'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function EditUserDialog() {
    const data = authClient.useSession().data
    const [name, setName] = useState<string>()
    const router = useRouter()
    const [image, setImage] = useState<File | null>(null)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setImage(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setImagePreview(reader.result as string)
            }
            reader.readAsDataURL(file)
        }
    }
    const [open, setOpen] = useState<boolean>(false)
    const [isLoading, startTransition] = useTransition()
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size='sm' className='gap-2' variant='secondary'>
                    <Edit size={13} />
                    Actualizar Información
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px] w-11/12'>
                <DialogHeader>
                    <DialogTitle>Editar información personal</DialogTitle>
                    <DialogDescription>
                        Actualiza tu información personal
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-2'>
                    <Label htmlFor='name'>Nombre completo</Label>
                    <Input
                        id='name'
                        type='name'
                        placeholder={data?.user.name}
                        required
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            setName(e.target.value)
                        }}
                    />
                    <div className='grid gap-2'>
                        <Label htmlFor='image'>Imagen de perfil</Label>
                        <div className='flex items-end gap-4'>
                            {imagePreview && (
                                <div className='relative w-16 h-16 rounded-sm overflow-hidden'>
                                    <Image
                                        src={imagePreview}
                                        alt='Profile preview'
                                        layout='fill'
                                        objectFit='cover'
                                    />
                                </div>
                            )}
                            <div className='flex items-center gap-2 w-full'>
                                <Input
                                    id='image'
                                    type='file'
                                    accept='image/*'
                                    onChange={handleImageChange}
                                    className='w-full text-muted-foreground'
                                />
                                {imagePreview && (
                                    <X
                                        className='cursor-pointer'
                                        onClick={() => {
                                            setImage(null)
                                            setImagePreview(null)
                                        }}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button
                        disabled={isLoading}
                        onClick={async () => {
                            startTransition(async () => {
                                await authClient.updateUser({
                                    image: image
                                        ? await convertImageToBase64(image)
                                        : undefined,
                                    name: name ? name : undefined,
                                    fetchOptions: {
                                        onSuccess: () => {
                                            toast.success(
                                                'User updated successfully'
                                            )
                                        },
                                        onError: (error: {
                                            error: { message: string }
                                        }) => {
                                            toast.error(error.error.message)
                                        }
                                    }
                                })
                                startTransition(() => {
                                    setName('')
                                    router.refresh()
                                    setImage(null)
                                    setImagePreview(null)
                                    setOpen(false)
                                })
                            })
                        }}>
                        {isLoading ? (
                            <Loader2 size={15} className='animate-spin' />
                        ) : (
                            'Actualizar'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function AddPasskey() {
    const [isOpen, setIsOpen] = useState(false)
    const [passkeyName, setPasskeyName] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleAddPasskey = async () => {
        if (!passkeyName) {
            toast.error('Nombre de la llave de acceso es obligatorio')
            return
        }
        setIsLoading(true)
        const res = await authClient.passkey.addPasskey({
            name: passkeyName
        })
        if (res?.error) {
            toast.error(res?.error.message)
        } else {
            setIsOpen(false)
            toast.success(
                'Llave de acceso agregada con éxito. Ahora puedes usarla para iniciar sesión.'
            )
        }
        setIsLoading(false)
    }
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' className='gap-2 text-xs md:text-sm'>
                    <Plus size={15} />
                    Agregar Llave de Acceso
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px] w-11/12'>
                <DialogHeader>
                    <DialogTitle>Agregar nueva llave de acceso</DialogTitle>
                    <DialogDescription>
                        Crea una nueva llave de acceso para tu cuenta para
                        iniciar sesión de forma segura, sin contraseña.
                    </DialogDescription>
                </DialogHeader>
                <div className='grid gap-2'>
                    <Label htmlFor='passkey-name'>
                        Nombre de la llave de acceso
                    </Label>
                    <Input
                        id='passkey-name'
                        value={passkeyName}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                            setPasskeyName(e.target.value)
                        }
                    />
                </div>
                <DialogFooter>
                    <Button
                        disabled={isLoading}
                        type='submit'
                        onClick={handleAddPasskey}
                        className='w-full'>
                        {isLoading ? (
                            <Loader2 size={15} className='animate-spin' />
                        ) : (
                            <>
                                <Fingerprint className='mr-2 h-4 w-4' />
                                Crear Llave de Acceso
                            </>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ListPasskeys() {
    const { data } = authClient.useListPasskeys()
    const [isOpen, setIsOpen] = useState(false)
    const [passkeyName, setPasskeyName] = useState('')

    const handleAddPasskey = async () => {
        if (!passkeyName) {
            toast.error('Nombre de la llave de acceso es obligatorio')
            return
        }
        setIsLoading(true)
        const res = await authClient.passkey.addPasskey({
            name: passkeyName
        })
        setIsLoading(false)
        if (res?.error) {
            toast.error(res?.error.message)
        } else {
            toast.success(
                'Llave de acceso agregada con éxito. Ahora puedes usarla para iniciar sesión.'
            )
        }
    }
    const [isLoading, setIsLoading] = useState(false)
    const [isDeletePasskey, setIsDeletePasskey] = useState<boolean>(false)
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant='outline' className='text-xs md:text-sm'>
                    <Fingerprint className='mr-2 h-4 w-4' />
                    <span>
                        Llaves de acceso{' '}
                        {data?.length ? `[${data?.length}]` : ''}
                    </span>
                </Button>
            </DialogTrigger>
            <DialogContent className='sm:max-w-[425px] w-11/12'>
                <DialogHeader>
                    <DialogTitle>Llaves de acceso</DialogTitle>
                    <DialogDescription>
                        Lista de llaves de acceso
                    </DialogDescription>
                </DialogHeader>
                {data?.length ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Nombre</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.map((passkey: Passkey) => (
                                <TableRow
                                    key={passkey.id}
                                    className='flex  justify-between items-center'>
                                    <TableCell>
                                        {passkey.name || 'My Passkey'}
                                    </TableCell>
                                    <TableCell className='text-right'>
                                        <button
                                            onClick={async () => {
                                                const res =
                                                    await authClient.passkey.deletePasskey(
                                                        {
                                                            id: passkey.id,
                                                            fetchOptions: {
                                                                onRequest:
                                                                    () => {
                                                                        setIsDeletePasskey(
                                                                            true
                                                                        )
                                                                    },
                                                                onSuccess:
                                                                    () => {
                                                                        toast(
                                                                            'Passkey deleted successfully'
                                                                        )
                                                                        setIsDeletePasskey(
                                                                            false
                                                                        )
                                                                    },
                                                                onError:
                                                                    (error: {
                                                                        error: {
                                                                            message: string
                                                                        }
                                                                    }) => {
                                                                        toast.error(
                                                                            error
                                                                                .error
                                                                                .message
                                                                        )
                                                                        setIsDeletePasskey(
                                                                            false
                                                                        )
                                                                    }
                                                            }
                                                        }
                                                    )
                                            }}>
                                            {isDeletePasskey ? (
                                                <Loader2
                                                    size={15}
                                                    className='animate-spin'
                                                />
                                            ) : (
                                                <Trash
                                                    size={15}
                                                    className='cursor-pointer text-red-600'
                                                />
                                            )}
                                        </button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <p className='text-sm text-muted-foreground'>
                        No tienes llaves de acceso agregadas.
                    </p>
                )}
                {!data?.length && (
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-col gap-2'>
                            <Label htmlFor='passkey-name' className='text-sm'>
                                Nueva llave de acceso
                            </Label>
                            <Input
                                id='passkey-name'
                                value={passkeyName}
                                onChange={(
                                    e: React.ChangeEvent<HTMLInputElement>
                                ) => setPasskeyName(e.target.value)}
                                placeholder='My Passkey'
                            />
                        </div>
                        <Button
                            type='submit'
                            onClick={handleAddPasskey}
                            className='w-full'>
                            {isLoading ? (
                                <Loader2 size={15} className='animate-spin' />
                            ) : (
                                <>
                                    <Fingerprint className='mr-2 h-4 w-4' />
                                    Crear Llave de Acceso
                                </>
                            )}
                        </Button>
                    </div>
                )}
                <DialogFooter>
                    <Button onClick={() => setIsOpen(false)}>Cerrar</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
