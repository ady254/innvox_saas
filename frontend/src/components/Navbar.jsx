import { useTenant } from "@/components/tenant-provider";

export default function Navbar() {
    const { client } = useTenant();

    return (
        <div>
            <h1>{client.name}</h1>
        </div>
    );
}