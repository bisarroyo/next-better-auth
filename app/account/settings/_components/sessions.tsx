'use client'
import { authClient } from '@/lib/auth-client'
import { Session } from '@/lib/auth-types'
import { Laptop, Loader2, Smartphone } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { UAParser } from 'ua-parser-js'

export default function Sessions({
    currentSession,
    activeSessionsProps
}: {
    currentSession: Session | null
    activeSessionsProps: Session['session'][]
}) {
    const [isTerminating, setIsTerminating] = useState<string>()
    const [activeSessions, setActiveSessions] = useState(activeSessionsProps)

    const router = useRouter()

    const removeActiveSession = (id: string) =>
        setActiveSessions(activeSessions.filter((session) => session.id !== id))
    return (
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
                                {new UAParser(session.userAgent || '').getOS()
                                    .name || session.userAgent}
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
                                            await authClient.revokeSession({
                                                token: session.token
                                            })

                                        if (res.error) {
                                            toast.error(res.error.message)
                                        } else {
                                            toast.success(
                                                'Sesión terminada con éxito'
                                            )
                                            removeActiveSession(session.id)
                                        }
                                        if (
                                            session.id ===
                                            currentSession?.session.id
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
                                      currentSession?.session.id ? (
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
    )
}
