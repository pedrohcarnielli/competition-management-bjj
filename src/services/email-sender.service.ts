import nodemailer from "nodemailer";

// Configuração do transportador de email
const getEmailTransporter = () => {
    const emailUser = process.env.EMAIL_USER;
    const emailPassword = process.env.EMAIL_PASSWORD;
    const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
    const emailPort = parseInt(process.env.EMAIL_PORT || "587");

    if (!emailUser || !emailPassword) {
        throw new Error("EMAIL_USER e EMAIL_PASSWORD devem ser configurados nas variáveis de ambiente");
    }

    return nodemailer.createTransport({
        host: emailHost,
        port: emailPort,
        secure: emailPort === 465, // true para 465, false para outras portas
        auth: {
            user: emailUser,
            pass: emailPassword,
        },
    });
};

export interface EmailMessage {
    to: string[];
    message: {
        subject: string;
        text: string;
    };
    createdAt: string;
}

export async function sendEmailMessage(emailData: EmailMessage): Promise<void> {
    try {
        const transporter = getEmailTransporter();

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
            to: emailData.to.join(","),
            subject: emailData.message.subject,
            text: emailData.message.text,
        });

        console.log(`[EMAIL ENVIADO] Para: ${emailData.to.join(", ")}, Assunto: ${emailData.message.subject}`);
    } catch (error) {
        console.error("[EMAIL ERRO] Falha ao enviar email:", error);
        throw error;
    }
}
