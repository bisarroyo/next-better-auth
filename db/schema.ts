import { sql } from 'drizzle-orm'
import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core'
import { user } from '@/auth-schema'

export const contacts = sqliteTable('contacts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    firstName: text('first_name').notNull(),
    lastName: text('last_name'),
    phone: text('phone').notNull(),
    countryCode: text('country_code').notNull(),
    email: text('email').notNull(),
    status: text('status').default('new'),
    priority: integer('priority').default(1),
    assignedTo: text('assigned_to')
        .references(() => user.id)
        .notNull(),
    notes: text('notes'),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
        sql`(unixepoch())`
    ),
    updatedAt: integer('updated_at', { mode: 'timestamp' })
        .default(sql`(unixepoch())`)
        .$onUpdate(() => new Date())
})

export const messages = sqliteTable('messages', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    contactId: integer('contact_id').references(() => contacts.id),
    userId: text('user_id')
        .references(() => user.id)
        .notNull(), // who sent (null if from contact)
    fromMe: integer('from_me', { mode: 'boolean' }).notNull(),
    body: text('body').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
        sql`(unixepoch())`
    )
})

export const tasks = sqliteTable('tasks', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    contactId: integer('contact_id').references(() => contacts.id),
    title: text('title').notNull(),
    dueAt: integer('due_at', { mode: 'timestamp' }).notNull(),
    status: text('status').default('pending'), // pending, done, canceled
    assignedTo: text('assigned_to')
        .references(() => user.id)
        .notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).default(
        sql`(unixepoch())`
    )
})
