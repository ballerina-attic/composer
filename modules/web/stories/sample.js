import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Sample from '../js/ballerina/react-views/sample';

storiesOf('sample', module)
  .add('Default', () => (
    <svg><Sample width={100} height={12}></Sample></svg>
  ));
