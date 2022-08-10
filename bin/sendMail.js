import nodemailer from 'nodemailer'
import chalk from 'chalk'
import path from 'path'
import fs from 'fs'
import { config as dotenv } from 'dotenv'
import { vituumVersion as version } from '../utils/common.js'
import { resolveConfig } from 'vite'

const vite = await resolveConfig({}, 'build')

dotenv()

const sendMail = async() => {
    const template = vite.vituum.emails.send.template
    const to = vite.vituum.emails.send.to

    console.info(`${chalk.cyan(`vituum v${version}`)} ${chalk.green('sending test email...')}`)

    if (!template) {
        console.info(`${chalk.cyan(`vituum v${version}`)} ${chalk.red('email template not defined')}`)
    }

    if (!to) {
        console.info(`${chalk.cyan(`vituum v${version}`)} ${chalk.red('email to not defined')}`)
    }

    if (!template || !to) {
        process.exit(1)
    }

    const transport = nodemailer.createTransport({
        host: process.env.VITUUM_SMTP_HOST || vite.vituum.emails.send.host,
        port: 465,
        auth: {
            user: process.env.VITUUM_SMTP_USER || vite.vituum.emails.send.user,
            pass: process.env.VITUUM_SMTP_PASS || vite.vituum.emails.send.pass
        }
    })

    const file = path.join(process.cwd(), template)

    if (!fs.existsSync(file)) {
        console.info(`${chalk.cyan(`vituum v${version}`)} ${chalk.red('email template not found')} ${chalk.gray(file)}`)
        process.exit(1)
    }

    const html = fs.readFileSync(file).toString()

    await transport.sendMail({
        from: vite.vituum.emails.send.from,
        to,
        subject: `${path.basename(process.cwd())} - ${path.basename(file)}`,
        html
    }, (error, info) => {
        if (error) {
            return console.error(chalk.red(error))
        }

        console.info(`${chalk.cyan(`vituum v${version}`)} ${chalk.green('test email sent')} ${chalk.gray(info.messageId)}`)
    })
}

export default sendMail
