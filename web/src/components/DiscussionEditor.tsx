import { Button, Card, Flex, Text, Textarea, TextInput } from "@mantine/core";
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { request, sage } from "../stores/api";
import { useAppStore } from "../stores/appStore";
import { useDiscussionStore } from "../stores/discussionStore";
import { wrapContent } from "../styles/css";
import CardLoader from "./cards/CardLoader";
import { CardPanel } from "./cards/CardPanel";
import OverlayLoader from "./cards/OverlayLoader";
import { useWait } from "./hooks";
import TextParser from "./TextParser";

interface Props {
  id: string | undefined;
}

interface State {
  loading: boolean;
  status: boolean | undefined;
}

function DiscussionEditor({ id }: Props) {
  const discussion = useAppStore(state => state.options.discussionEditor);
  const [state, setState] = useState<State>({ loading: !!id, status: undefined });

  const { t } = useTranslation();

  const navigate = useNavigate();
  const queryCreateDiscussion = useDiscussionStore(state => state.queryCreateDiscussion);
  const queryEditDiscussion = useDiscussionStore(state => state.queryEditDiscussion);

  const createDiscussion = async () => {
    if (state.loading) return;

    if (discussion.title.length === 0) return;
    if (discussion.title.length > 100) return;
    if (discussion.readme.length === 0) return;
    if (discussion.readme.length > 100000) return;

    setState(s => ({ ...s, loading: true, status: undefined }));
    const res = await useWait(() => queryCreateDiscussion(discussion.title, discussion.readme))();
    setState(s => ({ ...s, loading: false, status: res.status }));
    if (res.id) navigate(`/discussion/${res.id}`);
  }

  const editDiscussion = async () => {
    if (state.loading) return;
    if (!id) return;

    if (discussion.title.length === 0) return;
    if (discussion.title.length > 100) return;
    if (discussion.readme.length === 0) return;
    if (discussion.readme.length > 100000) return;

    setState(s => ({ ...s, loading: true, status: undefined }));
    const status = await useWait(() => queryEditDiscussion(id, discussion.title, discussion.readme))();
    setState(s => ({ ...s, loading: false, status: status }));
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

  const fetchRoute = async () => {
    if (!id || discussion.id === id) return;

    setState(s => ({ ...s, loading: true, status: undefined }));
    const out = await useWait(() => fetchDiscussion(id))();
    setState(s => ({ ...s, loading: false, status: out.status }));

    useAppStore.setState(s => {
      s.options.discussionEditor.id = id;
      s.options.discussionEditor.title = out.title;
      s.options.discussionEditor.readme = out.readme;
    })
  }

  const changeMode = (value: string) => {
    if (value === "edit" || value === "preview") {
      useAppStore.setState(s => { s.options.discussionEditor.mode = value });
    }
  }

  useEffect(() => { fetchRoute() }, []);

  if (id && state.loading) return <CardLoader />

  return (
    <Card shadow="sm" p="md" m="md" radius="md" withBorder>
      <Flex direction="column" gap="md">
        {state.loading && <OverlayLoader />}

        <CardPanel.Segments
          segments={[
            {
              value: discussion.mode,
              setValue: changeMode,
              label: t("mode"),
              data: [
                { label: t("editMode"), value: "edit" },
                { label: t("previewMode"), value: "preview" },
              ]
            }
          ]}
        />

        {discussion.mode === "edit" &&
          <>
            <TextInput
              radius="md"
              label={`${t("discussion.titleLabel")} (${discussion.title.length} / 100)`}
              description={t("discussion.titleDescription")}
              placeholder={t("discussion.title")}
              defaultValue={discussion.title}
              onChange={(ev) => useAppStore.setState(s => { s.options.discussionEditor.title = ev.target.value })}
            />

            <Textarea
              radius="md"
              label={`${t("discussion.readmeLabel")} (${discussion.readme.length} / 100000)`}
              description={t("discussion.readmeDescription")}
              placeholder={t("discussion.readme")}
              defaultValue={discussion.readme}
              onChange={(ev) => useAppStore.setState(s => { s.options.discussionEditor.readme = ev.target.value })}
              autosize
            />

            <Flex>
              <Button onClick={id ? editDiscussion : createDiscussion} color="dark" radius="md">
                {id ? t("discussion.edit") : t("discussion.create")}
              </Button>
            </Flex>
          </>
        }

        {discussion.mode === "preview" &&
          <>
            <Flex direction="column">
              {t("discussion.titleLabel")}
              <Card withBorder>
                <Text css={wrapContent}>
                  <TextParser text={discussion.title} />
                </Text>
              </Card>
            </Flex>

            <Flex direction="column">
              {t("discussion.readmeLabel")}
              <Card withBorder>
                <Text css={wrapContent}>
                  <TextParser text={discussion.readme} />
                </Text>
              </Card>
            </Flex>
          </>
        }
      </Flex>
    </Card>
  )
}

export default DiscussionEditor