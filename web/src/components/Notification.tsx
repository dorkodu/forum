import { INotification } from "@api/types/notification"

interface Props {
  notification: INotification;
}

function Notification({ notification }: Props) {
  return (
    <>
      {notification.id}
    </>
  )
}

export default Notification