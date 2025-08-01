import { title } from "@/helper/util/primitives";
import DefaultLayout from "@/layouts/page-layout";

export default function DocsPage() {
  return (
    <DefaultLayout refClass={null}>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Blog</h1>
        </div>
      </section>
    </DefaultLayout>
  );
}
