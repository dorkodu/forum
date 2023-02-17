import { Button, Card, Textarea, TextInput } from "@mantine/core";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useAuthStore } from "../stores/authStore";
import { useDiscussionStore } from "../stores/discussionStore";
import CardLoader from "./cards/CardLoader";
import OverlayLoader from "./cards/OverlayLoader";
import { useWait } from "./hooks";

interface Props {
  id: string | undefined;
}

interface State {
  initial: boolean;

  loading: boolean;
  status: boolean | undefined;

  title: string;
  readme: string;
}

function DiscussionEditor({ id }: Props) {
  const [state, setState] = useState<State>(
    { title: "", readme: "", initial: true, loading: !!id, status: undefined }
  );

  const { t } = useTranslation();

  const setRequestLogin = useAppStore(state => state.setRequestLogin);
  const currentUserId = useAuthStore(state => state.userId);

  const navigate = useNavigate();
  const queryCreateDiscussion = useDiscussionStore(state => state.queryCreateDiscussion);
  const queryEditDiscussion = useDiscussionStore(state => state.queryEditDiscussion);

  const createDiscussion = async () => {
    if (state.loading) return;

    if (state.title.length === 0) return;
    if (state.title.length > 100) return;
    if (state.readme.length === 0) return;
    if (state.readme.length > 100000) return;

    setState({ ...state, loading: true, status: undefined });
    const res = await useWait(() => queryCreateDiscussion(state.title, state.readme))();
    setState({ ...state, loading: false, status: res.status });
    if (res.id) navigate(`/discussion/${res.id}`);
  }

  const editDiscussion = async () => {
    if (state.loading) return;
    if (!id) return;

    if (state.title.length === 0) return;
    if (state.title.length > 100) return;
    if (state.readme.length === 0) return;
    if (state.readme.length > 100000) return;

    setState({ ...state, loading: true, status: undefined });
    const status = await useWait(() => queryEditDiscussion(id, state.title, state.readme))();
    setState({ ...state, loading: false, status: status });
    navigate(`/discussion/${id}`);
  }

  const fetchDiscussion = async (id: string) => {
    const res = await sage.get(
      { a: sage.query("getDiscussion", { discussionId: id }), },
      (query) => useWait(() => request(query))()
    )

    const status = !(!res?.a.data || res.a.error);
    const discussion = res?.a.data;

    return { status, title: discussion?.title ?? "", readme: discussion?.readme ?? "" };
  }

  useEffect(() => {
    (async () => {
      // If user is trying to create discussion while not being logged in
      if (!currentUserId) {
        setRequestLogin(true);
        navigate("/home");
        return;
      }

      if (!id) return;
      setState({ ...state, loading: true, status: undefined });
      const out = await useWait(() => fetchDiscussion(id))();
      setState({ ...state, ...out, loading: false, initial: false });
    })();
  }, []);

  if (!currentUserId) return (<></>)

  if (id && state.initial && state.loading) return <CardLoader />

  return (
    <Card shadow="sm" p="lg" m="md" radius="md" withBorder>
      {state.loading && <OverlayLoader />}

      <TextInput
        radius="md"
        label={`${t("discussion.titleLabel")} (${state.title.length} / 100)`}
        description={t("discussion.titleDescription")}
        placeholder={t("discussion.title")}
        defaultValue={state.title}
        onChange={(ev) => { setState({ ...state, title: ev.target.value }) }}
        pb="md"
      />

      <Textarea
        radius="md"
        label={`${t("discussion.readmeLabel")} (${state.readme.length} / 100000)`}
        description={t("discussion.readmeDescription")}
        placeholder={t("discussion.readme")}
        defaultValue={state.readme}
        onChange={(ev) => setState({ ...state, readme: ev.target.value })}
        autosize
        pb="md"
      />

      <Button onClick={id ? editDiscussion : createDiscussion} color="dark" radius="md">
        {id ? t("discussion.edit") : t("discussion.create")}
      </Button>
    </Card>
  )
}

export default DiscussionEditor