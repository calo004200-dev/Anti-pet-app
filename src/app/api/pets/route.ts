import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const { name, type, breed, rescueContact, photoBase64 } = await req.json();

        if (!name || !type || !rescueContact) {
            logger.warn(`Intento de registro de mascota fallido: faltan campos. Usuario ${session.user.id}`);
            return NextResponse.json({ message: "Faltan datos requeridos" }, { status: 400 });
        }

        const pet = await prisma.pet.create({
            data: {
                name,
                type,
                breed,
                rescueContact,
                photo: photoBase64,
                ownerId: session.user.id
            }
        });

        logger.info(`Nueva mascota registrada exitosamente. Usuario: ${session.user.id}, Mascota: ${pet.id} (${pet.name})`);
        return NextResponse.json({ message: "Mascota registrada", pet }, { status: 201 });
    } catch (error: any) {
        logger.error("Error crítico al registrar mascota", { error: error.message, stack: error.stack });
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
