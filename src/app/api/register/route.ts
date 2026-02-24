import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try {
        const { name, email, password } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ message: "Faltan datos requeridos" }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ message: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return NextResponse.json({ message: "El correo ya está registrado" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
            },
        });

        return NextResponse.json({ message: "Usuario creado correctamente" }, { status: 201 });
    } catch (error) {
        console.error("Error en registro:", error);
        return NextResponse.json({ message: "Error interno del servidor" }, { status: 500 });
    }
}
