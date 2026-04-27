import { Request, Response } from "express";
import { sendEmailMessage } from "../services/email-sender.service";

export async function testEmailHandler(req: Request, res: Response): Promise<void> {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
        res.status(400).json({
            error: "Campos obrigatórios: to (array de strings), subject (string), text (string)",
        });
        return;
    }

    const recipients: string[] = Array.isArray(to) ? to : [to];

    await sendEmailMessage({
        to: recipients,
        message: { subject, text },
        createdAt: new Date().toISOString(),
    });

    res.json({
        success: true,
        message: `Email enviado com sucesso para: ${recipients.join(", ")}`,
    });
}
