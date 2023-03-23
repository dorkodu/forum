import { Alert, Card, DefaultMantineColor } from "@mantine/core"
import { IconAlertCircle, IconCircleCheck, IconInfoCircle } from "@tabler/icons-react";

interface Props {
  type: "success" | "error" | "info";
  title: string;
  content: string;
}

function CardAlert({ type, title, content }: Props) {
  const icon = () => {
    switch (type) {
      case "success": return <IconCircleCheck size={24} />;
      case "error": return <IconAlertCircle size={24} />;
      case "info": return <IconInfoCircle size={24} />;
    }
  }

  const color = (): DefaultMantineColor => {
    switch (type) {
      case "success": return "green";
      case "error": return "red";
      case "info": return "blue";
    }
  }

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Alert icon={icon()} title={title} color={color()} variant="light">
        {content}
      </Alert>
    </Card>
  )
}

export default CardAlert