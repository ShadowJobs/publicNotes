import { Helmet } from "react-helmet-async";

type PageTitleProps = {
  title?: string;
};

export default function PageTitle({ title }: PageTitleProps) {
  return (
    <Helmet>
      <title>{title ? `${title} - mon` : "mon"}</title>
    </Helmet>
  );
}
