import { createAccessControl } from 'better-auth/plugins/access'

export const statement = {
    leads: ['create', 'update', 'delete', 'view'], // <-- Permissions available for created roles
    user: ['ban']
} as const

export const ac = createAccessControl(statement)

export const user = ac.newRole({
    leads: ['view', 'update']
})

export const admin = ac.newRole({
    leads: ['create', 'update', 'delete', 'view']
})

export const agent = ac.newRole({
    leads: ['create', 'update', 'delete'],
    user: ['ban']
})
