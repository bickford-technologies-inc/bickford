import { ConstitutionalEnforcer } from "../../core/ConstitutionalEnforcer";
import { ExecutionAuthority } from "../../core/ExecutionAuthority";
import { Ledger } from "../../ledger/ledger";

const enforcer = new ConstitutionalEnforcer();
const ledger = new Ledger();

export const authority = new ExecutionAuthority(enforcer, ledger);
