import * as React from 'react';
import { ExternalLink } from 'lucide-react';
import LocalizedLink from './LocalizedLink';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { sourcePath, type SourceSummary } from '@/lib/taxonomy';

type LinkedSourceListProps = {
  sources: SourceSummary[];
  emptyMessage: React.ReactNode;
};

const fallbackDescription = (source: SourceSummary): string =>
  `${source.name} is a News Shuffle source for ${source.canonicalKey}.`;

const LinkedSourceList = ({ sources, emptyMessage }: LinkedSourceListProps): JSX.Element => {
  if (!sources.length) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="grid gap-3">
      {sources.map((source) => {
        let host = source.url;
        try {
          host = new URL(source.url).host;
        } catch {}

        return (
          <Card key={source.id} className="rounded-lg shadow-sm">
            <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <LocalizedLink
                    to={sourcePath(source.id)}
                    className="text-base font-semibold text-card-foreground hover:underline"
                  >
                    {source.name}
                  </LocalizedLink>
                  {typeof source.score === 'number' && Number.isFinite(source.score) && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {source.score.toFixed(1)}
                    </Badge>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                  {source.description || fallbackDescription(source)}
                </p>
              </div>

              <Button
                asChild
                variant="ghost"
                className="shrink-0 justify-start gap-2 sm:justify-center"
              >
                <a href={source.url} target="_blank" rel="noopener">
                  {host}
                  <ExternalLink aria-hidden="true" className="h-4 w-4" />
                </a>
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default LinkedSourceList;
