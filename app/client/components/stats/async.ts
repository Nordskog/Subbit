import { asyncComponent } from 'react-async-component';

const AsyncStats = asyncComponent(
    {
        // TODO loading/error components, but this will never be used by the user anyway.
        resolve: () => new Promise((resolve) =>
            // Webpack's code splitting API w/naming
            (require as any).ensure(
              [],
              (require) => {
                resolve(require('./container'));
              },
              'statsChunk'
            )
          )
    });

export default AsyncStats;
