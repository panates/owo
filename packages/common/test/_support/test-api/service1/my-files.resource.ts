import { HttpOperation, HttpResource } from '@opra/common';

@HttpResource({
  description: 'My files resource'
})
export class MyFilesResource {

  @HttpOperation.Multipart.GET()
  get() {
    //
  }

  @HttpOperation.Multipart.POST({})
  post() {
    //
  }

}
