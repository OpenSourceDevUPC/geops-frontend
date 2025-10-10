import {HelpEntity} from '../domain/model/help.entity';

export class HelpAssembler {
  static fromResponse(response: any): HelpEntity {
    return {
      id: response.id,
      question: response.question,
      answer: response.answer,
    };
  }

  static fromResponseArray(responseArray: any[]): HelpEntity[] {
    return responseArray.map(HelpAssembler.fromResponse);
  }
}
