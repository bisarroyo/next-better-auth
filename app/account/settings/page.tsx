import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
// import { OrganizationCard } from './organization-card'
import UserCard from './user-card'

export default async function DashboardPage() {
    const [session, activeSessions, deviceSessions, organization] =
        await Promise.all([
            auth.api.getSession({
                headers: await headers()
            }),
            auth.api.listSessions({
                headers: await headers()
            }),
            auth.api.listDeviceSessions({
                headers: await headers()
            }),
            auth.api.getFullOrganization({
                headers: await headers()
            })
        ]).catch((e) => {
            console.log(e)
            throw redirect('/signin')
        })

    console.log(activeSessions)
    return (
        <div className='w-full flex items-center justify-center'>
            <div className='flex gap-4 flex-col max-w-7xl w-full mx-auto mt-4'>
                <UserCard
                    session={JSON.parse(JSON.stringify(session))}
                    activeSessions={JSON.parse(JSON.stringify(activeSessions))}
                />
                {/* <OrganizationCard
                    session={JSON.parse(JSON.stringify(session))}
                    activeOrganization={JSON.parse(
                        JSON.stringify(organization)
                    )}
                /> */}
            </div>
        </div>
    )
}
