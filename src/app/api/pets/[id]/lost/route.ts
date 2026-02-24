import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { logger } from "@/lib/logger";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const session = await getServerSession(authOptions);

        if (!session || !session.user) {
            return NextResponse.json({ message: "No autorizado" }, { status: 401 });
        }

        const { isLost, lastSeenLocation } = await req.json();

        const pet = await prisma.pet.findUnique({
            where: { id }
        });

        if (!pet || pet.ownerId !== session.user.id) {
            return NextResponse.json({ message: "Mascota no encontrada o no autorizada" }, { status: 404 });
        }

        const updatedPet = await prisma.pet.update({
            where: { id },
            data: {
                isLost,
                lastSeenLocation: isLost ? lastSeenLocation : null
            },
            include: {
                owner: true
            }
        });

        if (isLost && process.env.N8N_WEBHOOK_URL) {
            // Run webhook call asynchronously to not block the response
            fetch(process.env.N8N_WEBHOOK_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'pet_lost',
                    pet_id: updatedPet.id,
                    pet_name: updatedPet.name,
                    pet_type: updatedPet.type,
                    photo_url: updatedPet.photo,     // base64 in MVP
                    last_seen: lastSeenLocation,
                    owner_name: updatedPet.owner.name,
                    owner_contact: updatedPet.rescueContact
                })
            }).catch(err => console.error("Error triggering n8n webhook:", err));
        }

        logger.info(`Alerta SOS disparada. Mascota: ${updatedPet.id}, Perdida: ${isLost}, Location: ${lastSeenLocation}`);
        return NextResponse.json({ message: "Estado de rescate actualizado", pet: updatedPet }, { status: 200 });
    } catch (error: any) {
        logger.error("Error crítico en endpoint SOS", { error: error.message, stack: error.stack });
        return NextResponse.json({ message: "Error interno" }, { status: 500 });
    }
}
